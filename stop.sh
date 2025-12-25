#!/bin/bash

# Startup Template - Stop All Services
# This script stops Supabase, Backend, and Frontend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default ports
DEFAULT_SUPABASE_API_PORT=58421
DEFAULT_SUPABASE_DB_PORT=58422
DEFAULT_SUPABASE_STUDIO_PORT=58423
DEFAULT_SUPABASE_EMAIL_PORT=58424
DEFAULT_SUPABASE_ANALYTICS_PORT=58428
DEFAULT_SUPABASE_SHADOW_PORT=58420
DEFAULT_SUPABASE_POOLER_PORT=58429
DEFAULT_BACKEND_PORT=18000
DEFAULT_FRONTEND_PORT=13000

# Actual ports (will be read from config.toml)
SUPABASE_API_PORT=$DEFAULT_SUPABASE_API_PORT
SUPABASE_DB_PORT=$DEFAULT_SUPABASE_DB_PORT
SUPABASE_STUDIO_PORT=$DEFAULT_SUPABASE_STUDIO_PORT
SUPABASE_EMAIL_PORT=$DEFAULT_SUPABASE_EMAIL_PORT
SUPABASE_ANALYTICS_PORT=$DEFAULT_SUPABASE_ANALYTICS_PORT
SUPABASE_SHADOW_PORT=$DEFAULT_SUPABASE_SHADOW_PORT
SUPABASE_POOLER_PORT=$DEFAULT_SUPABASE_POOLER_PORT
BACKEND_PORT=$DEFAULT_BACKEND_PORT
FRONTEND_PORT=$DEFAULT_FRONTEND_PORT

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to read actual ports from config.toml
read_ports_from_config() {
    local config_file="supabase/config.toml"
    if [ ! -f "$config_file" ]; then
        print_status "Config.toml not found, using default ports"
        return
    fi
    
    print_status "Reading ports from config.toml..."
    
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
    
    # Update global port variables
    SUPABASE_API_PORT=$api_port
    SUPABASE_DB_PORT=$db_port
    SUPABASE_STUDIO_PORT=$studio_port
    SUPABASE_EMAIL_PORT=$email_port
    
    print_status "Using ports from config.toml: API=$api_port, DB=$db_port, Studio=$studio_port, Email=$email_port"
}

# Function to aggressively kill any process bound to a port (handles uvicorn reload children)
kill_process_on_port() {
    local port=$1
    local service_name=$2
    
    if ! port_in_use $port; then
        return
    fi
    
    print_status "Killing process on port $port ($service_name)..."
    
    # Use lsof first
    if command_exists lsof; then
        lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | xargs kill -9 > /dev/null 2>&1 || true
    fi
    
    # Try fuser if available
    if command_exists fuser; then
        fuser -k "${port}/tcp" > /dev/null 2>&1 || true
    fi
    
    # Catch uvicorn/watchfiles processes that may not be listening yet but hold the port soon
    if [ "$service_name" = "Backend" ]; then
        pkill -f "uvicorn.*:${port}" > /dev/null 2>&1 || true
        pkill -f "uvicorn.*--port ${port}" > /dev/null 2>&1 || true
        pkill -f "watchfiles.*uvicorn.*${port}" > /dev/null 2>&1 || true
    fi
    
    sleep 1
}

# Function to forcefully stop Supabase and clean up Docker containers
# Only stops containers for this specific project (startup-template)
force_stop_supabase() {
    print_status "Stopping Supabase for this project (startup-template)..."
    
    # Use Supabase CLI to stop - this is the safest way and respects project boundaries
    if command_exists supabase; then
        # Change to the directory with supabase config
        cd "$SCRIPT_DIR" || exit 1
        
        # Stop using project-id to ensure we only stop this project
        if supabase stop --project-id startup-template 2>&1; then
            print_success "Supabase stopped via CLI"
        else
            # Fallback: try stopping from current directory (CLI detects project automatically)
            print_status "Trying alternative stop method..."
            supabase stop 2>&1 || true
        fi
    else
        print_warning "Supabase CLI not found, using Docker directly..."
    fi
    
    # Wait a bit for containers to stop gracefully
    sleep 2
    
    if ! command_exists docker; then
        print_warning "Docker not found, skipping container cleanup"
        return
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_warning "Docker is not running, skipping container cleanup"
        return
    fi
    
    # Only stop containers specific to this project
    # Supabase containers follow pattern: supabase_[service]_[project_id]
    local project_id="startup-template"
    local project_containers=$(docker ps -a --filter "name=${project_id}" --format "{{.ID}} {{.Names}}" 2>/dev/null || true)
    
    if [ -n "$project_containers" ]; then
        print_status "Stopping project-specific containers..."
        # Extract container IDs
        local container_ids=$(echo "$project_containers" | awk '{print $1}')
        for container_id in $container_ids; do
            local container_name=$(echo "$project_containers" | grep "^$container_id" | awk '{print $2}')
            # Only stop if it's actually a startup-template container
            if echo "$container_name" | grep -q "${project_id}"; then
                print_status "Stopping container: $container_name"
                docker stop "$container_id" > /dev/null 2>&1 || true
                docker rm -f "$container_id" > /dev/null 2>&1 || true
            fi
        done
        sleep 1
    fi
    
    # Also check for containers using our specific ports (only our project's ports)
    # This is a safety check in case CLI didn't catch everything
    local ports_to_check=("$SUPABASE_API_PORT" "$SUPABASE_DB_PORT" "$SUPABASE_STUDIO_PORT" "$SUPABASE_EMAIL_PORT" "$SUPABASE_ANALYTICS_PORT" "$SUPABASE_SHADOW_PORT" "$SUPABASE_POOLER_PORT")
    
    for port in "${ports_to_check[@]}"; do
        # Find containers using this specific port
        local container_info=$(docker ps --format "{{.ID}} {{.Names}} {{.Ports}}" 2>/dev/null | grep -E ":$port->|0.0.0.0:$port|127.0.0.1:$port" || true)
        if [ -n "$container_info" ]; then
            # Only stop if container name contains our project_id
            local matching_containers=$(echo "$container_info" | grep "${project_id}" || true)
            if [ -n "$matching_containers" ]; then
                local container_ids=$(echo "$matching_containers" | awk '{print $1}')
                for container_id in $container_ids; do
                    local container_name=$(echo "$matching_containers" | grep "^$container_id" | awk '{print $2}')
                    print_status "Stopping container using port $port: $container_name"
                    docker stop "$container_id" > /dev/null 2>&1 || true
                    docker rm -f "$container_id" > /dev/null 2>&1 || true
                done
            fi
        fi
        
        # Kill processes using our ports (this is safe as it's our project's ports)
        kill_process_on_port $port "Supabase"
    done
    
    # Final wait to ensure everything is cleaned up
    sleep 1
    print_success "Supabase cleanup completed for project: startup-template"
}

# Stop Backend
stop_backend() {
    print_status "Stopping Backend..."
    kill_process_on_port $BACKEND_PORT "Backend"
    if ! port_in_use $BACKEND_PORT; then
        print_success "Backend stopped"
    else
        print_warning "Backend may still be running on port $BACKEND_PORT"
    fi
}

# Stop Frontend
stop_frontend() {
    print_status "Stopping Frontend..."
    kill_process_on_port $FRONTEND_PORT "Frontend"
    if ! port_in_use $FRONTEND_PORT; then
        print_success "Frontend stopped"
    else
        print_warning "Frontend may still be running on port $FRONTEND_PORT"
    fi
}

# Main execution
print_status "Stopping all services..."

# Read ports from config.toml
read_ports_from_config

# Stop Supabase first (most important)
force_stop_supabase

# Stop Backend
stop_backend

# Stop Frontend
stop_frontend

print_success "All services stopped!"
echo ""
