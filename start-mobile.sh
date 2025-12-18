#!/bin/bash

# Startup Template - Start Mobile (Expo)
# This script starts the Expo mobile development server

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is not installed"
    exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
    echo "Error: npx is not installed"
    exit 1
fi

# Start Mobile
print_status "Starting Mobile (Expo)..."
cd mobile

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing mobile dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[WARNING]${NC} .env file not found. Copying from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}[WARNING]${NC} Please update mobile/.env with your actual configuration"
    else
        echo "Error: .env.example not found in mobile directory"
        exit 1
    fi
fi

print_success "Starting Expo..."
echo ""
echo -e "${GREEN}Mobile development server starting...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Start Expo
npx expo start

