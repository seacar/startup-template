#!/bin/bash

# Startup Template - Start All Services
# This script starts Supabase, Backend, and Frontend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default ports
DEFAULT_SUPABASE_API_PORT=58426
DEFAULT_SUPABASE_DB_PORT=58427
DEFAULT_SUPABASE_STUDIO_PORT=58428
DEFAULT_SUPABASE_EMAIL_PORT=58429
DEFAULT_SUPABASE_ANALYTICS_PORT=58433
DEFAULT_SUPABASE_SHADOW_PORT=58425
DEFAULT_SUPABASE_POOLER_PORT=58434
DEFAULT_BACKEND_PORT=18005
DEFAULT_FRONTEND_PORT=13005
DEFAULT_REDIS_PORT=6384
DEFAULT_SRH_PORT=8084

# Ports (will be adjusted if conflicts detected)
SUPABASE_API_PORT=$DEFAULT_SUPABASE_API_PORT
SUPABASE_DB_PORT=$DEFAULT_SUPABASE_DB_PORT
SUPABASE_STUDIO_PORT=$DEFAULT_SUPABASE_STUDIO_PORT
SUPABASE_EMAIL_PORT=$DEFAULT_SUPABASE_EMAIL_PORT
SUPABASE_ANALYTICS_PORT=$DEFAULT_SUPABASE_ANALYTICS_PORT
SUPABASE_SHADOW_PORT=$DEFAULT_SUPABASE_SHADOW_PORT
SUPABASE_POOLER_PORT=$DEFAULT_SUPABASE_POOLER_PORT
BACKEND_PORT=$DEFAULT_BACKEND_PORT
FRONTEND_PORT=$DEFAULT_FRONTEND_PORT
REDIS_PORT=$DEFAULT_REDIS_PORT
SRH_PORT=$DEFAULT_SRH_PORT
SRH_TOKEN="local_dev_token"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Global variables for Supabase credentials
SUPABASE_URL=""
SUPABASE_PUBLISHABLE_KEY=""
SUPABASE_SECRET_KEY=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_key() {
    echo -e "${CYAN}$1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use (checks both processes and Docker containers)
port_in_use() {
    local port=$1
    
    # Check if a process is using the port
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    fi
    
    # Check if Docker has a container using this port
    if command_exists docker && docker info > /dev/null 2>&1; then
        # Check running containers
        if docker ps --format "{{.Ports}}" 2>/dev/null | grep -qE ":$port->|0.0.0.0:$port|127.0.0.1:$port"; then
            return 0
        fi
        # Check all containers (including stopped ones that might have port bindings)
        if docker ps -a --format "{{.Ports}}" 2>/dev/null | grep -qE ":$port->|0.0.0.0:$port|127.0.0.1:$port"; then
            return 0
        fi
    fi
    
    return 1
}

# Function to aggressively kill any process bound to a port (handles uvicorn reload children)
kill_process_on_port() {
    local port=$1
    
    # Use lsof first
    if command_exists lsof; then
        lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | xargs kill -9 > /dev/null 2>&1 || true
    fi
    
    # Try fuser if available
    if command_exists fuser; then
        fuser -k "${port}/tcp" > /dev/null 2>&1 || true
    fi
    
    # Catch uvicorn/watchfiles processes that may not be listening yet but hold the port soon
    pkill -f "uvicorn.*:${port}" > /dev/null 2>&1 || true
    pkill -f "uvicorn.*--port ${port}" > /dev/null 2>&1 || true
    pkill -f "watchfiles.*uvicorn.*${port}" > /dev/null 2>&1 || true
    
    sleep 1
}

# Function to find next available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while port_in_use $port; do
        port=$((port + 1))
        if [ $port -gt $((start_port + 100)) ]; then
            print_error "Could not find available port starting from $start_port"
            exit 1
        fi
    done
    echo $port
}

# Function to update Supabase config.toml with new ports
update_supabase_config() {
    local config_file="supabase/config.toml"
    if [ ! -f "$config_file" ]; then
        return
    fi
    
    print_status "Updating Supabase config.toml with new ports..."
    
    # Backup original config
    cp "$config_file" "$config_file.bak" 2>/dev/null || true
    
    # Update ports in config.toml using sed with section-aware patterns
    # macOS sed requires a backup extension, Linux sed can use empty string
    local sed_inplace="sed -i.bak"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sed_inplace="sed -i"
    fi
    
    if command_exists sed; then
        # Update [api] port - match any port number in the [api] section
        $sed_inplace "/^\[api\]$/,/^\[/ s/^port = [0-9]*$/port = $SUPABASE_API_PORT/" "$config_file" 2>/dev/null || true
        
        # Update [db] port - match any port number in the [db] section
        $sed_inplace "/^\[db\]$/,/^\[db\./ s/^port = [0-9]*$/port = $SUPABASE_DB_PORT/" "$config_file" 2>/dev/null || true
        $sed_inplace "/^\[db\]$/,/^\[db\./ s/^shadow_port = [0-9]*$/shadow_port = $SUPABASE_SHADOW_PORT/" "$config_file" 2>/dev/null || true
        
        # Update [db.pooler] port
        $sed_inplace "/^\[db.pooler\]$/,/^\[/ s/^port = [0-9]*$/port = $SUPABASE_POOLER_PORT/" "$config_file" 2>/dev/null || true
        
        # Update [studio] port
        $sed_inplace "/^\[studio\]$/,/^\[/ s/^port = [0-9]*$/port = $SUPABASE_STUDIO_PORT/" "$config_file" 2>/dev/null || true
        
        # Update [inbucket] port
        $sed_inplace "/^\[inbucket\]$/,/^\[/ s/^port = [0-9]*$/port = $SUPABASE_EMAIL_PORT/" "$config_file" 2>/dev/null || true
        
        # Update [analytics] port
        $sed_inplace "/^\[analytics\]$/,/^\[/ s/^port = [0-9]*$/port = $SUPABASE_ANALYTICS_PORT/" "$config_file" 2>/dev/null || true
        
        rm -f "$config_file.bak" 2>/dev/null || true
        print_success "Supabase config.toml updated with ports: API=$SUPABASE_API_PORT, DB=$SUPABASE_DB_PORT, Studio=$SUPABASE_STUDIO_PORT, Analytics=$SUPABASE_ANALYTICS_PORT"
    else
        print_warning "sed not found. Please manually update supabase/config.toml with new ports"
    fi
}

# Function to update env file with new Supabase URL
update_env_file() {
    local env_file=$1
    local url_var=$2
    local new_url=$3
    
    if [ ! -f "$env_file" ]; then
        return
    fi
    
    # Update the URL in the env file
    if command_exists sed; then
        # Determine sed command based on OS
        local sed_cmd="sed -i.bak"
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sed_cmd="sed -i"
        fi
        
        # Match the pattern and replace the URL part - match any port number
        # Update URLs with 127.0.0.1
        $sed_cmd "s|${url_var}=http://127.0.0.1:[0-9]*|${url_var}=http://127.0.0.1:$SUPABASE_API_PORT|g" "$env_file" 2>/dev/null || true
        # Update URLs with localhost
        $sed_cmd "s|${url_var}=http://localhost:[0-9]*|${url_var}=http://localhost:$SUPABASE_API_PORT|g" "$env_file" 2>/dev/null || true
        rm -f "$env_file.bak" 2>/dev/null || true
    fi
}

# Global variable to track if ports were changed
PORTS_CHANGED=false

# Function to read actual ports from config.toml and fix duplicates
fix_config_port_conflicts() {
    local config_file="supabase/config.toml"
    if [ ! -f "$config_file" ]; then
        return
    fi
    
    print_status "Checking config.toml for port conflicts..."
    
    # Read actual ports from config (more robust parsing)
    local api_port=$(awk '/^\[api\]/,/^\[/ {if (/^port = /) {print $3; exit}}' "$config_file" 2>/dev/null || echo "$DEFAULT_SUPABASE_API_PORT")
    local db_port=$(awk '/^\[db\]/,/^\[db\./ {if (/^port = /) {print $3; exit}}' "$config_file" 2>/dev/null || echo "$DEFAULT_SUPABASE_DB_PORT")
    local studio_port=$(awk '/^\[studio\]/,/^\[/ {if (/^port = /) {print $3; exit}}' "$config_file" 2>/dev/null || echo "$DEFAULT_SUPABASE_STUDIO_PORT")
    local email_port=$(awk '/^\[inbucket\]/,/^\[/ {if (/^port = /) {print $3; exit}}' "$config_file" 2>/dev/null || echo "$DEFAULT_SUPABASE_EMAIL_PORT")
    
    # Remove any non-numeric characters and validate
    api_port=$(echo "$api_port" | tr -d '[:space:]' | grep -E '^[0-9]+$' || echo "$DEFAULT_SUPABASE_API_PORT")
    db_port=$(echo "$db_port" | tr -d '[:space:]' | grep -E '^[0-9]+$' || echo "$DEFAULT_SUPABASE_DB_PORT")
    studio_port=$(echo "$studio_port" | tr -d '[:space:]' | grep -E '^[0-9]+$' || echo "$DEFAULT_SUPABASE_STUDIO_PORT")
    email_port=$(echo "$email_port" | tr -d '[:space:]' | grep -E '^[0-9]+$' || echo "$DEFAULT_SUPABASE_EMAIL_PORT")
    
    # Check if any ports are duplicates
    local ports=("$api_port" "$db_port" "$studio_port" "$email_port")
    local has_duplicates=false
    
    for i in "${!ports[@]}"; do
        for j in "${!ports[@]}"; do
            if [ $i -ne $j ] && [ "${ports[$i]}" = "${ports[$j]}" ] && [ -n "${ports[$i]}" ]; then
                has_duplicates=true
                print_warning "Duplicate port detected: ${ports[$i]} used by multiple services"
                break 2
            fi
        done
    done
    
    if [ "$has_duplicates" = true ]; then
        print_warning "Found duplicate ports in config.toml. Resetting to defaults..."
        PORTS_CHANGED=true
        
        # Reset to default ports
        SUPABASE_API_PORT=$DEFAULT_SUPABASE_API_PORT
        SUPABASE_DB_PORT=$DEFAULT_SUPABASE_DB_PORT
        SUPABASE_STUDIO_PORT=$DEFAULT_SUPABASE_STUDIO_PORT
        SUPABASE_EMAIL_PORT=$DEFAULT_SUPABASE_EMAIL_PORT
        
        # Update config with defaults
        update_supabase_config
        print_success "Config.toml ports reset to defaults"
    else
        # Use ports from config if they're valid
        SUPABASE_API_PORT=$api_port
        SUPABASE_DB_PORT=$db_port
        SUPABASE_STUDIO_PORT=$studio_port
        SUPABASE_EMAIL_PORT=$email_port
        print_status "Using ports from config.toml: API=$api_port, DB=$db_port, Studio=$studio_port, Email=$email_port"
    fi
}

# Function to check and adjust ports
check_and_adjust_ports() {
    print_status "Checking for port conflicts..."
    
    # First, fix any internal port conflicts in config
    fix_config_port_conflicts
    
    PORTS_CHANGED=false
    
    # Check Supabase API port
    if port_in_use $SUPABASE_API_PORT; then
        print_warning "Port $SUPABASE_API_PORT (Supabase API) is in use"
        SUPABASE_API_PORT=$(find_available_port $SUPABASE_API_PORT)
        print_status "Using port $SUPABASE_API_PORT for Supabase API instead"
        PORTS_CHANGED=true
    fi
    
    # Check Supabase DB port
    if port_in_use $SUPABASE_DB_PORT; then
        print_warning "Port $SUPABASE_DB_PORT (Supabase DB) is in use"
        SUPABASE_DB_PORT=$(find_available_port $SUPABASE_DB_PORT)
        print_status "Using port $SUPABASE_DB_PORT for Supabase DB instead"
        PORTS_CHANGED=true
    fi
    
    # Check Supabase Studio port
    if port_in_use $SUPABASE_STUDIO_PORT; then
        print_warning "Port $SUPABASE_STUDIO_PORT (Supabase Studio) is in use"
        SUPABASE_STUDIO_PORT=$(find_available_port $SUPABASE_STUDIO_PORT)
        print_status "Using port $SUPABASE_STUDIO_PORT for Supabase Studio instead"
        PORTS_CHANGED=true
    fi
    
    # Check Supabase Email port
    if port_in_use $SUPABASE_EMAIL_PORT; then
        print_warning "Port $SUPABASE_EMAIL_PORT (Supabase Email) is in use"
        SUPABASE_EMAIL_PORT=$(find_available_port $SUPABASE_EMAIL_PORT)
        print_status "Using port $SUPABASE_EMAIL_PORT for Supabase Email instead"
        PORTS_CHANGED=true
    fi
    
    # Check Supabase Analytics port (often conflicts with other projects)
    if port_in_use $SUPABASE_ANALYTICS_PORT; then
        print_warning "Port $SUPABASE_ANALYTICS_PORT (Supabase Analytics) is in use"
        SUPABASE_ANALYTICS_PORT=$(find_available_port $SUPABASE_ANALYTICS_PORT)
        print_status "Using port $SUPABASE_ANALYTICS_PORT for Supabase Analytics instead"
        PORTS_CHANGED=true
    fi
    
    # Check Supabase Shadow port
    if port_in_use $SUPABASE_SHADOW_PORT; then
        print_warning "Port $SUPABASE_SHADOW_PORT (Supabase Shadow DB) is in use"
        SUPABASE_SHADOW_PORT=$(find_available_port $SUPABASE_SHADOW_PORT)
        print_status "Using port $SUPABASE_SHADOW_PORT for Supabase Shadow DB instead"
        PORTS_CHANGED=true
    fi
    
    # Check Supabase Pooler port
    if port_in_use $SUPABASE_POOLER_PORT; then
        print_warning "Port $SUPABASE_POOLER_PORT (Supabase Pooler) is in use"
        SUPABASE_POOLER_PORT=$(find_available_port $SUPABASE_POOLER_PORT)
        print_status "Using port $SUPABASE_POOLER_PORT for Supabase Pooler instead"
        PORTS_CHANGED=true
    fi
    
    # Check Backend port
    if port_in_use $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT (Backend) is in use"
        BACKEND_PORT=$(find_available_port $BACKEND_PORT)
        print_status "Using port $BACKEND_PORT for Backend instead"
        PORTS_CHANGED=true
    fi
    
    # Check Frontend port
    if port_in_use $FRONTEND_PORT; then
        print_warning "Port $FRONTEND_PORT (Frontend) is in use"
        FRONTEND_PORT=$(find_available_port $FRONTEND_PORT)
        print_status "Using port $FRONTEND_PORT for Frontend instead"
        PORTS_CHANGED=true
    fi
    
    # Check Redis port
    if port_in_use $REDIS_PORT; then
        print_warning "Port $REDIS_PORT (Redis) is in use"
        REDIS_PORT=$(find_available_port $REDIS_PORT)
        print_status "Using port $REDIS_PORT for Redis instead"
        PORTS_CHANGED=true
    fi
    
    # Check SRH port
    if port_in_use $SRH_PORT; then
        print_warning "Port $SRH_PORT (SRH) is in use"
        SRH_PORT=$(find_available_port $SRH_PORT)
        print_status "Using port $SRH_PORT for SRH instead"
        PORTS_CHANGED=true
    fi
    
    if [ "$PORTS_CHANGED" = true ]; then
        print_warning "Port conflicts detected. Updating configuration files..."
        update_supabase_config
        
        # Determine sed command based on OS
        local sed_cmd="sed -i.bak"
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sed_cmd="sed -i"
        fi
        
        # Update backend .env files
        if [ -f "backend/.env" ]; then
            update_env_file "backend/.env" "SUPABASE_URL" "http://127.0.0.1:$SUPABASE_API_PORT"
            $sed_cmd "s/SUPABASE_DB_PORT=.*/SUPABASE_DB_PORT=$SUPABASE_DB_PORT/" backend/.env 2>/dev/null || true
            rm -f backend/.env.bak 2>/dev/null || true
        fi
        # Always update .env.example files when ports change
        if [ -f "backend/.env.example" ]; then
            update_env_file "backend/.env.example" "SUPABASE_URL" "http://127.0.0.1:$SUPABASE_API_PORT"
            $sed_cmd "s/SUPABASE_DB_PORT=.*/SUPABASE_DB_PORT=$SUPABASE_DB_PORT/" backend/.env.example 2>/dev/null || true
            rm -f backend/.env.example.bak 2>/dev/null || true
            print_status "Updated backend/.env.example with new ports"
        fi
        
        # Update frontend .env files
        if [ -f "frontend/.env.local" ]; then
            update_env_file "frontend/.env.local" "NEXT_PUBLIC_SUPABASE_URL" "http://127.0.0.1:$SUPABASE_API_PORT"
            rm -f frontend/.env.local.bak 2>/dev/null || true
        fi
        # Always update .env.example files when ports change
        if [ -f "frontend/.env.example" ]; then
            update_env_file "frontend/.env.example" "NEXT_PUBLIC_SUPABASE_URL" "http://127.0.0.1:$SUPABASE_API_PORT"
            rm -f frontend/.env.example.bak 2>/dev/null || true
            print_status "Updated frontend/.env.example with new ports"
        fi
        
        # Update mobile .env files
        if [ -f "mobile/.env" ]; then
            update_env_file "mobile/.env" "EXPO_PUBLIC_SUPABASE_URL" "http://127.0.0.1:$SUPABASE_API_PORT"
            rm -f mobile/.env.bak 2>/dev/null || true
        fi
        # Always update .env.example files when ports change
        if [ -f "mobile/.env.example" ]; then
            update_env_file "mobile/.env.example" "EXPO_PUBLIC_SUPABASE_URL" "http://127.0.0.1:$SUPABASE_API_PORT"
            rm -f mobile/.env.example.bak 2>/dev/null || true
            print_status "Updated mobile/.env.example with new ports"
        fi
        
        print_success "Configuration files updated with new ports"
    else
        print_success "No port conflicts detected"
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    echo ""
    print_warning "$service_name may not be ready yet"
    return 1
}

# Function to start Redis and SRH via docker compose
start_redis() {
    print_status "Starting Redis and SRH (Serverless Redis HTTP) via Docker Compose..."
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found"
        return 1
    fi
    
    # Check if Redis container is already running
    local redis_running=false
    if docker ps --format "{{.Names}}" | grep -q "^startup-template-redis$"; then
        print_status "Redis container is already running"
        redis_running=true
    fi
    
    # Check if SRH container is already running
    local srh_running=false
    if docker ps --format "{{.Names}}" | grep -q "^startup-template-srh$"; then
        print_status "SRH container is already running"
        srh_running=true
    fi
    
    # Export environment variables for docker compose to use
    export REDIS_PORT=$REDIS_PORT
    export SRH_PORT=$SRH_PORT
    export SRH_TOKEN=$SRH_TOKEN
    
    # Try docker compose first (newer Docker versions), fallback to docker-compose
    local compose_cmd="docker compose"
    if ! docker compose version > /dev/null 2>&1; then
        if command_exists docker-compose; then
            compose_cmd="docker-compose"
        else
            print_error "Neither docker compose nor docker-compose found"
            return 1
        fi
    fi
    
    # Start Redis and SRH using docker compose
    if $compose_cmd up -d redis serverless-redis-http 2>&1; then
        print_success "Redis and SRH containers started"
        
        # Wait for Redis to be ready
        if [ "$redis_running" = false ]; then
            print_status "Waiting for Redis to be ready..."
            local max_attempts=30
            local attempt=1
            while [ $attempt -le $max_attempts ]; do
                if docker exec startup-template-redis redis-cli ping > /dev/null 2>&1; then
                    print_success "Redis is ready!"
                    break
                fi
                echo -n "."
                sleep 1
                attempt=$((attempt + 1))
            done
            echo ""
        fi
        
        # Wait for SRH to be ready
        if [ "$srh_running" = false ]; then
            print_status "Waiting for SRH to be ready..."
            local max_attempts=30
            local attempt=1
            while [ $attempt -le $max_attempts ]; do
                if curl -s -f "http://localhost:$SRH_PORT/health" > /dev/null 2>&1; then
                    print_success "SRH is ready!"
                    break
                fi
                echo -n "."
                sleep 1
                attempt=$((attempt + 1))
            done
            echo ""
        fi
        
        return 0
    else
        print_error "Failed to start Redis/SRH containers"
        return 1
    fi
}

# Function to get Supabase keys
get_supabase_keys() {
    # Wait a moment for Supabase to fully initialize
    sleep 3
    
    local status_output=$(supabase status 2>/dev/null || echo "")
    if [ -z "$status_output" ]; then
        print_warning "Could not retrieve Supabase status. Keys may not be available yet."
        return
    fi
    
    # Parse supabase status output
    # New format uses table with:
    # │ Publishable │ sb_publishable_... │
    # │ Secret      │ sb_secret_...      │
    # Old format used:
    # API URL: http://127.0.0.1:58421
    # anon key: eyJ...
    # service_role key: eyJ...
    
    # Try to get Project URL or API URL from table format
    local api_url=$(echo "$status_output" | grep -E "│[[:space:]]*(Project URL|API URL)" | head -1 | sed -E 's/.*│[[:space:]]*(http[^[:space:]│]+).*/\1/' | tr -d ' ')
    
    # If not found in table, try old format
    if [ -z "$api_url" ]; then
        api_url=$(echo "$status_output" | grep -i "API URL" | head -1 | sed -E 's/.*API URL:[[:space:]]*//' | tr -d ' ')
    fi
    
    # Parse keys from new table format
    local publishable_key=$(echo "$status_output" | grep -E "│[[:space:]]*Publishable[[:space:]]*│" | head -1 | sed -E 's/.*│[[:space:]]*Publishable[[:space:]]*│[[:space:]]*//' | sed -E 's/[[:space:]]*│.*//' | tr -d ' ')
    local secret_key=$(echo "$status_output" | grep -E "│[[:space:]]*Secret[[:space:]]*│" | head -1 | sed -E 's/.*│[[:space:]]*Secret[[:space:]]*│[[:space:]]*//' | sed -E 's/[[:space:]]*│.*//' | tr -d ' ')
    
    # Fallback to old format if new format parsing failed
    if [ -z "$publishable_key" ]; then
        publishable_key=$(echo "$status_output" | grep -i "publishable key" | head -1 | sed -E 's/.*publishable key:[[:space:]]*//' | tr -d ' ')
    fi
    if [ -z "$publishable_key" ]; then
        publishable_key=$(echo "$status_output" | grep -i "anon key" | head -1 | sed -E 's/.*anon key:[[:space:]]*//' | tr -d ' ')
    fi
    
    if [ -z "$secret_key" ]; then
        secret_key=$(echo "$status_output" | grep -i "secret key" | head -1 | sed -E 's/.*secret key:[[:space:]]*//' | tr -d ' ')
    fi
    if [ -z "$secret_key" ]; then
        secret_key=$(echo "$status_output" | grep -i "service_role key" | head -1 | sed -E 's/.*service_role key:[[:space:]]*//' | tr -d ' ')
    fi
    
    # Use default API URL if not found
    if [ -z "$api_url" ]; then
        api_url="http://127.0.0.1:$SUPABASE_API_PORT"
    fi
    
    # Store in global variables for use by update_env_files
    SUPABASE_URL="$api_url"
    SUPABASE_PUBLISHABLE_KEY="$publishable_key"
    SUPABASE_SECRET_KEY="$secret_key"
    
    # Display keys
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Supabase Keys:${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${BLUE}API URL:${NC}              ${CYAN}$api_url${NC}"
    
    if [ -n "$publishable_key" ]; then
        echo -e "  ${BLUE}Publishable Key:${NC}      ${CYAN}$publishable_key${NC}"
    else
        print_warning "Publishable key not found. Run 'supabase status' to retrieve it."
    fi
    
    if [ -n "$secret_key" ]; then
        echo -e "  ${BLUE}Secret Key:${NC}           ${CYAN}$secret_key${NC}"
    else
        print_warning "Secret key not found. Run 'supabase status' to retrieve it."
    fi
    
    echo ""
    echo -e "${YELLOW}Environment files will be automatically updated with these values${NC}"
    
    if [ "$SUPABASE_API_PORT" != "$DEFAULT_SUPABASE_API_PORT" ]; then
        echo ""
        print_warning "Note: Ports were changed from defaults. Configuration files have been updated."
    fi
    echo ""
}

# Function to update .env files with Supabase credentials
update_env_files() {
    print_status "Updating environment files with Supabase credentials..."
    
    # Update backend .env file
    local backend_env="$SCRIPT_DIR/backend/.env"
    if [ -f "$backend_env" ]; then
        print_status "Updating backend/.env..."
        
        # Create a backup
        cp "$backend_env" "$backend_env.backup" 2>/dev/null || true
        
        # Update or add SUPABASE_URL
        if grep -q "^SUPABASE_URL=" "$backend_env"; then
            sed -i.tmp "s|^SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" "$backend_env"
        else
            echo "SUPABASE_URL=$SUPABASE_URL" >> "$backend_env"
        fi
        
        # Update or add SUPABASE_PUBLISHABLE_KEY
        if [ -n "$SUPABASE_PUBLISHABLE_KEY" ]; then
            if grep -q "^SUPABASE_PUBLISHABLE_KEY=" "$backend_env"; then
                sed -i.tmp "s|^SUPABASE_PUBLISHABLE_KEY=.*|SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY|" "$backend_env"
            else
                echo "SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY" >> "$backend_env"
            fi
        fi
        
        # Update or add SUPABASE_SECRET_KEY
        if [ -n "$SUPABASE_SECRET_KEY" ]; then
            if grep -q "^SUPABASE_SECRET_KEY=" "$backend_env"; then
                sed -i.tmp "s|^SUPABASE_SECRET_KEY=.*|SUPABASE_SECRET_KEY=$SUPABASE_SECRET_KEY|" "$backend_env"
            else
                echo "SUPABASE_SECRET_KEY=$SUPABASE_SECRET_KEY" >> "$backend_env"
            fi
        fi
        
        # Update or add REDIS_REST_URL and REDIS_REST_TOKEN (for Upstash compatibility via SRH)
        local redis_rest_url="http://localhost:$SRH_PORT"
        if grep -q "^REDIS_REST_URL=" "$backend_env"; then
            sed -i.tmp "s|^REDIS_REST_URL=.*|REDIS_REST_URL=$redis_rest_url|" "$backend_env"
        else
            echo "REDIS_REST_URL=$redis_rest_url" >> "$backend_env"
        fi
        
        if grep -q "^REDIS_REST_TOKEN=" "$backend_env"; then
            sed -i.tmp "s|^REDIS_REST_TOKEN=.*|REDIS_REST_TOKEN=$SRH_TOKEN|" "$backend_env"
        else
            echo "REDIS_REST_TOKEN=$SRH_TOKEN" >> "$backend_env"
        fi
        
        # Keep REDIS_URL as fallback (for direct Redis connection if needed)
        local redis_url="redis://localhost:$REDIS_PORT"
        if grep -q "^REDIS_URL=" "$backend_env"; then
            sed -i.tmp "s|^REDIS_URL=.*|REDIS_URL=$redis_url|" "$backend_env"
        else
            echo "REDIS_URL=$redis_url" >> "$backend_env"
        fi
        
        # Update PORT if needed
        if grep -q "^PORT=" "$backend_env"; then
            sed -i.tmp "s|^PORT=.*|PORT=$BACKEND_PORT|" "$backend_env"
        else
            echo "PORT=$BACKEND_PORT" >> "$backend_env"
        fi
        
        # Clean up temp files
        rm -f "$backend_env.tmp" 2>/dev/null || true
        
        print_success "Backend .env updated"
    else
        print_warning "Backend .env file not found at $backend_env"
    fi
    
    # Update frontend .env.local file
    local frontend_env="$SCRIPT_DIR/frontend/.env.local"
    print_status "Updating frontend/.env.local..."
    
    # Create .env.local if it doesn't exist
    if [ ! -f "$frontend_env" ]; then
        touch "$frontend_env"
        print_status "Created frontend/.env.local"
    else
        # Create a backup
        cp "$frontend_env" "$frontend_env.backup" 2>/dev/null || true
    fi
    
    # Update or add NEXT_PUBLIC_SUPABASE_URL
    if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" "$frontend_env"; then
        sed -i.tmp "s|^NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" "$frontend_env"
    else
        echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> "$frontend_env"
    fi
    
    # Update or add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if [ -n "$SUPABASE_PUBLISHABLE_KEY" ]; then
        if grep -q "^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=" "$frontend_env"; then
            sed -i.tmp "s|^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY|" "$frontend_env"
        else
            echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY" >> "$frontend_env"
        fi
    fi
    
    # Clean up temp files
    rm -f "$frontend_env.tmp" 2>/dev/null || true
    
    print_success "Frontend .env.local updated"
    
    echo ""
    print_success "All environment files updated with Supabase credentials!"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Shutting down services..."
    
    # Stop Redis and SRH
    if [ -f "docker-compose.yml" ]; then
        print_status "Stopping Redis and SRH..."
        local compose_cmd="docker compose"
        if ! docker compose version > /dev/null 2>&1; then
            if command_exists docker-compose; then
                compose_cmd="docker-compose"
            fi
        fi
        if docker compose version > /dev/null 2>&1 || command_exists docker-compose; then
            $compose_cmd stop redis serverless-redis-http > /dev/null 2>&1 || true
        fi
    fi
    
    # Kill backend if running
    if [ -n "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        print_status "Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Kill frontend if running
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        print_status "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Also try to kill any processes on our ports
    if port_in_use $BACKEND_PORT; then
        kill_process_on_port $BACKEND_PORT
    fi
    if port_in_use $FRONTEND_PORT; then
        kill_process_on_port $FRONTEND_PORT
    fi
    
    # Kill any remaining background jobs
    jobs -p | xargs kill > /dev/null 2>&1 || true
    
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists supabase; then
    print_error "Supabase CLI is not installed. Please install it: npm install -g supabase"
    exit 1
fi

if ! command_exists python3; then
    print_error "Python 3 is not installed"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command_exists docker; then
    print_warning "Docker is not running. Supabase requires Docker."
    print_warning "Please start Docker and run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_success "All prerequisites met!"

# Stop all services first using the stop script
print_status "Stopping any running services..."
if [ -f "./stop.sh" ]; then
    ./stop.sh
else
    print_warning "stop.sh not found, skipping stop step"
fi

# Check and adjust ports before starting services
check_and_adjust_ports

# Function to stop all services (legacy - now uses stop.sh)
stop_all_services() {
    print_status "Stopping any running services..."
    
    # Stop Backend first (kill processes on backend port)
    if port_in_use $BACKEND_PORT; then
        print_status "Stopping Backend (port $BACKEND_PORT)..."
        kill_process_on_port $BACKEND_PORT
    fi
    
    # Stop Frontend (kill processes on frontend port)
    if port_in_use $FRONTEND_PORT; then
        print_status "Stopping Frontend (port $FRONTEND_PORT)..."
        kill_process_on_port $FRONTEND_PORT
    fi
    
    # Also kill any uvicorn processes that might be running
    pkill -f "uvicorn.*src.main:app" > /dev/null 2>&1 || true
    sleep 1
    
    # Also kill any node processes running next dev
    pkill -f "next dev" > /dev/null 2>&1 || true
    sleep 1
    
    # Use the stop script for Supabase if available
    if [ -f "./stop.sh" ]; then
        ./stop.sh > /dev/null 2>&1 || true
    else
        # Fallback: try to stop Supabase
        if command_exists supabase; then
            supabase stop --project-id startup-template > /dev/null 2>&1 || true
            supabase stop > /dev/null 2>&1 || true
        fi
    fi
    
    # Final check - wait a moment for ports to be released
    sleep 2
    
    print_success "All services stopped"
    echo ""
}

# Function to verify Supabase is fully ready
wait_for_supabase_ready() {
    print_status "Verifying Supabase is fully ready..."
    local max_wait=90
    local waited=0
    local supabase_ready=false
    
    while [ $waited -lt $max_wait ]; do
        # Check if Supabase status command works and shows running services
        local status_output=$(supabase status 2>/dev/null || echo "")
        
        if [ -n "$status_output" ]; then
            # Check if status shows "running" or contains API URL
            if echo "$status_output" | grep -qi "running\|Project URL\|API URL\|REST" > /dev/null 2>&1; then
                # Extract API URL from status
                local api_url=$(echo "$status_output" | grep -i "Project URL\|API URL" | head -1 | sed -E 's/.*(http:\/\/[^[:space:]]+).*/\1/' | tr -d ' ' || echo "")
                
                # If we got an API URL, try to verify it's actually responding
                if [ -n "$api_url" ]; then
                    # Try to access the REST API endpoint (this is more reliable than /health)
                    if curl -s -f --max-time 2 "${api_url}/rest/v1/" > /dev/null 2>&1; then
                        supabase_ready=true
                        break
                    fi
                else
                    # If status shows running but no URL, check our configured port directly
                    if curl -s -f --max-time 2 "http://127.0.0.1:$SUPABASE_API_PORT/rest/v1/" > /dev/null 2>&1; then
                        supabase_ready=true
                        break
                    fi
                fi
            fi
        fi
        
        echo -n "."
        sleep 2
        waited=$((waited + 2))
    done
    
    echo ""
    
    if [ "$supabase_ready" = true ]; then
        return 0
    else
        # Show status for debugging
        print_warning "Supabase status check:"
        supabase status 2>&1 | head -10 || true
        return 1
    fi
}

# Stop all services before starting
stop_all_services

# Update Supabase config if ports were changed
if [ "$PORTS_CHANGED" = true ]; then
    print_status "Updating Supabase configuration with new ports..."
    update_supabase_config
    print_success "Supabase config.toml updated with new ports"
fi

# Start Redis first (lightweight, fast startup)
if ! start_redis; then
    print_warning "Redis failed to start, but continuing with other services..."
fi
echo ""

# Start Supabase
print_status "Starting Supabase for project: startup-template (this may take a minute on first run)..."
print_status "Logs will be displayed in the console..."

# Ensure we're in the right directory (Supabase CLI detects project from config.toml)
cd "$SCRIPT_DIR" || exit 1

# Start Supabase - CLI automatically detects project from supabase/config.toml
# The project_id in config.toml ensures containers are properly scoped
if ! supabase start 2>&1; then
    print_error "Failed to start Supabase"
    print_warning "Check the output above for details"
    exit 1
fi

# Wait for Supabase to be fully ready
if wait_for_supabase_ready; then
    print_success "Supabase is ready!"
    sleep 1  # Brief pause to ensure everything is settled
    get_supabase_keys
    
    # Update environment files with Supabase credentials
    update_env_files
else
    print_error "Supabase started but is not responding properly"
    print_warning "Run 'supabase status' manually to check the status"
    print_error "Cannot proceed without a working Supabase instance"
    exit 1
fi

# Ensure Supabase is ready before proceeding (double-check)
print_status "Final verification: Ensuring Supabase is ready before starting other services..."
if ! wait_for_supabase_ready; then
    print_error "Supabase is not ready. Cannot start backend and frontend services."
    exit 1
fi
print_success "Supabase verified and ready!"
echo ""

# Start Backend
print_status "Starting Backend (FastAPI + Uvicorn)..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_warning "Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    print_status "Installing backend dependencies..."
    pip install -q -r requirements.txt
    touch venv/.installed
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Copying from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please update backend/.env with your actual configuration"
    else
        print_error ".env.example not found in backend directory"
        exit 1
    fi
fi

# Start backend server
# Double-check port is free (in case something started after stop_all_services)
if port_in_use $BACKEND_PORT; then
    print_warning "Port $BACKEND_PORT is still in use. Force stopping..."
    kill_process_on_port $BACKEND_PORT
    sleep 2
    
    if port_in_use $BACKEND_PORT; then
        print_error "Port $BACKEND_PORT is still in use after cleanup. Please manually stop the process."
        BACKEND_PID=""
    else
        print_status "Port cleared. Starting uvicorn on port $BACKEND_PORT..."
    fi
else
    print_status "Starting uvicorn on port $BACKEND_PORT..."
fi

if [ -z "$BACKEND_PID" ] && ! port_in_use $BACKEND_PORT; then
    # Start uvicorn in background, output to console
    cd "$SCRIPT_DIR/backend" || exit 1
    source venv/bin/activate
    # Start uvicorn in background, output goes to console
    uvicorn src.main:app --reload --host 0.0.0.0 --port $BACKEND_PORT &
    BACKEND_PID=$!
    cd "$SCRIPT_DIR" || exit 1
    
    # Give it a moment to start
    sleep 2
    
    if [ -n "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        print_status "Backend started with PID: $BACKEND_PID"
        wait_for_service "http://localhost:$BACKEND_PORT/health" "Backend API"
    else
        print_error "Failed to start backend. Check console output above for errors."
        BACKEND_PID=""
    fi
elif port_in_use $BACKEND_PORT; then
    print_warning "Skipping backend start - port $BACKEND_PORT is still in use"
    BACKEND_PID=""
fi

# Start Frontend
print_status "Starting Frontend (Next.js)..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. Copying from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_warning "Please update frontend/.env.local with your actual configuration"
    else
        print_error ".env.example not found in frontend directory"
        exit 1
    fi
fi

# Start frontend server
if port_in_use $FRONTEND_PORT; then
    print_warning "Port $FRONTEND_PORT is already in use. Frontend may already be running."
    FRONTEND_PID=""
else
    print_status "Starting Next.js on port $FRONTEND_PORT..."
    # Start Next.js in background, output to console
    cd "$SCRIPT_DIR/frontend" || exit 1
    # Start Next.js in background, output goes to console
    PORT=$FRONTEND_PORT npm run dev &
    FRONTEND_PID=$!
    cd "$SCRIPT_DIR" || exit 1
    
    # Give it a moment to start
    sleep 2
    
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        print_status "Frontend started with PID: $FRONTEND_PID"
        wait_for_service "http://localhost:$FRONTEND_PORT" "Frontend"
    else
        print_error "Failed to start frontend. Check console output above for errors."
        FRONTEND_PID=""
    fi
fi

# Print service URLs
echo ""
print_success "All services started!"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Services Running:${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}        http://localhost:$FRONTEND_PORT"
echo -e "  ${BLUE}Backend API:${NC}      http://localhost:$BACKEND_PORT"
echo -e "  ${BLUE}API Docs:${NC}         http://localhost:$BACKEND_PORT/docs"
echo -e "  ${BLUE}Health Check:${NC}     http://localhost:$BACKEND_PORT/health"
echo -e "  ${BLUE}Redis:${NC}            redis://localhost:$REDIS_PORT"
echo -e "  ${BLUE}SRH (Redis HTTP):${NC}  http://localhost:$SRH_PORT"
echo -e "  ${BLUE}Supabase Studio:${NC}  http://127.0.0.1:$SUPABASE_STUDIO_PORT"
echo -e "  ${BLUE}Supabase API:${NC}      http://127.0.0.1:$SUPABASE_API_PORT"
echo -e "  ${BLUE}Email Testing:${NC}     http://127.0.0.1:$SUPABASE_EMAIL_PORT"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""
echo -e "${BLUE}Note:${NC} Backend and Frontend logs are displayed in the console above"
echo ""

# Keep script running and wait for background processes
# Use a loop to check if processes are still running
print_status "Monitoring services (press Ctrl+C to stop all)..."
while true; do
    # Check if backend is still running
    if [ -n "$BACKEND_PID" ] && ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_warning "Backend process (PID: $BACKEND_PID) has stopped"
        BACKEND_PID=""
    fi
    
    # Check if frontend is still running
    if [ -n "$FRONTEND_PID" ] && ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_warning "Frontend process (PID: $FRONTEND_PID) has stopped"
        FRONTEND_PID=""
    fi
    
    # If both processes have stopped (and we started them), exit
    if [ -z "$BACKEND_PID" ] && [ -z "$FRONTEND_PID" ]; then
        # Only exit if we actually tried to start them
        # If ports were in use, PIDs would be empty but services are running
        if ! port_in_use $BACKEND_PORT && ! port_in_use $FRONTEND_PORT; then
            print_warning "All services have stopped"
            break
        fi
    fi
    
    # Sleep and check again
    sleep 5
done
