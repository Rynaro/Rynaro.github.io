#!/bin/bash

# jex.sh - Jekyll Docker Execution Script
# Usage: ./jex.sh [command] [args...]

# ======================================================
# CONFIGURATION
# ======================================================

JEX_VERSION="1.0.0"
DOCKER_IMAGE="jekyll-site"
JEX_DIR="${HOME}/.jex"
JEX_CONFIG="${JEX_DIR}/config"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ======================================================
# CORE UTILITIES
# ======================================================

# Create the jex directory structure if it doesn't exist
function ensure_jex_dir() {
  if [ ! -d "${JEX_DIR}" ]; then
    mkdir -p "${JEX_DIR}"
    mkdir -p "${JEX_DIR}/templates"
    
    # Create default config if it doesn't exist
    if [ ! -f "${JEX_CONFIG}" ]; then
      cat > "${JEX_CONFIG}" << EOF
DOCKER_IMAGE="jekyll-site"
JEKYLL_PORT=4000
# Default user/group IDs (will be overridden at runtime)
USER_ID=$(id -u)
GROUP_ID=$(id -g)
EOF
    fi
    
    # Create Dockerfile template
    cat > "${JEX_DIR}/templates/Dockerfile" << 'EOF'
FROM ruby:3.2-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /site

# Install Jekyll and Bundler
RUN gem install jekyll bundler webrick

# Expose port 4000 for Jekyll server
EXPOSE 4000

# Add volume for site content
VOLUME /site

# Command to run when container starts
# Using webrick since it's no longer bundled with Ruby 3.0+
CMD ["sh", "-c", "if [ ! -f Gemfile ]; then jekyll new . --force; fi && bundle install && bundle exec jekyll serve --host 0.0.0.0 --livereload"]
EOF

    # Create gitignore template
    cat > "${JEX_DIR}/templates/gitignore" << 'EOF'
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
.bundle/
vendor/
.DS_Store
EOF
  fi
}

# Function to display command execution
function run_cmd() {
  echo -e "${YELLOW}> $1${NC}"
  eval "$1"
}

# Function to show error message and exit
function error_exit() {
  echo -e "${RED}ERROR: $1${NC}" >&2
  exit 1
}

# Function to fix permissions of files
function fix_permissions() {
  local dir=${1:-.}
  USER_ID=$(id -u)
  GROUP_ID=$(id -g)
  
  echo -e "${YELLOW}Fixing file permissions in $dir...${NC}"
  
  # Check if we need sudo (if files are owned by root)
  if [ -f "$dir/_config.yml" ] && [ $(stat -c "%u" "$dir/_config.yml") -ne $USER_ID ]; then
    # Try with sudo
    if command -v sudo >/dev/null 2>&1; then
      run_cmd "sudo chown -R $USER_ID:$GROUP_ID $dir"
    else
      echo -e "${RED}Warning: Some files may be owned by root. Unable to use sudo to fix.${NC}"
      echo -e "${YELLOW}You may need to manually run: chown -R $(id -un):$(id -gn) $dir${NC}"
    fi
  else
    # No need for sudo
    run_cmd "chown -R $USER_ID:$GROUP_ID $dir"
  fi
}

# Load config if it exists
function load_config() {
  if [ -f "${JEX_CONFIG}" ]; then
    source "${JEX_CONFIG}"
  fi
}

# ======================================================
# IMAGE DOMAIN
# ======================================================

# Build the Docker image
function image_build() {
  echo -e "${BLUE}Building Jekyll Docker image...${NC}"
  run_cmd "docker build -t $DOCKER_IMAGE ."
}

# Remove Docker image 
function image_remove() {
  echo -e "${RED}Warning: This will remove the Jekyll Docker image.${NC}"
  echo -e "${YELLOW}Do you want to continue? (y/n)${NC}"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    run_cmd "docker rmi $DOCKER_IMAGE"
    echo -e "${GREEN}Image removed.${NC}"
  else
    echo -e "${BLUE}Operation canceled.${NC}"
  fi
}

# ======================================================
# CONTAINER DOMAIN
# ======================================================

# Start Jekyll server with live reload
function container_serve() {
  echo -e "${BLUE}Starting Jekyll server with live reload...${NC}"
  USER_ID=$(id -u)
  GROUP_ID=$(id -g)
  run_cmd "docker run --rm -v $(pwd):/site -u $USER_ID:$GROUP_ID -p ${JEKYLL_PORT:-4000}:4000 $DOCKER_IMAGE"
}

# Run Jekyll server in background
function container_serve_detached() {
  echo -e "${BLUE}Starting Jekyll server in detached mode...${NC}"
  USER_ID=$(id -u)
  GROUP_ID=$(id -g)
  run_cmd "docker run -d --name jekyll-container -v $(pwd):/site -u $USER_ID:$GROUP_ID -p ${JEKYLL_PORT:-4000}:4000 $DOCKER_IMAGE"
  echo -e "${GREEN}Server running at http://localhost:${JEKYLL_PORT:-4000}${NC}"
  echo -e "${YELLOW}To stop server: ./jex.sh stop${NC}"
}

# Stop detached Jekyll server
function container_stop() {
  echo -e "${BLUE}Stopping Jekyll server...${NC}"
  run_cmd "docker stop jekyll-container && docker rm jekyll-container"
}

# Run a command inside the Jekyll container
function container_exec() {
  if [ -z "$1" ]; then
    error_exit "Please provide a command to execute"
  fi

  # Get current user and group IDs
  USER_ID=$(id -u)
  GROUP_ID=$(id -g)

  echo -e "${BLUE}Executing command in Jekyll container...${NC}"
  run_cmd "docker run --rm -v $(pwd):/site -u $USER_ID:$GROUP_ID $DOCKER_IMAGE sh -c \"$1\""
}

# Clean up all Jekyll Docker containers
function container_clean() {
  echo -e "${RED}Warning: This will remove all Jekyll containers.${NC}"
  echo -e "${YELLOW}Do you want to continue? (y/n)${NC}"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    run_cmd "docker stop jekyll-container 2>/dev/null || true"
    run_cmd "docker rm jekyll-container 2>/dev/null || true"
    echo -e "${GREEN}Containers cleaned up.${NC}"
  else
    echo -e "${BLUE}Clean up canceled.${NC}"
  fi
}

# ======================================================
# PROJECT DOMAIN
# ======================================================

# Initialize a new Jekyll project
function project_init() {
  echo -e "${BLUE}Initializing new Jekyll project...${NC}"

  # Create Dockerfile if it doesn't exist
  if [ ! -f "Dockerfile" ]; then
    echo -e "${YELLOW}Creating Dockerfile...${NC}"
    cp "${JEX_DIR}/templates/Dockerfile" Dockerfile
  fi

  # Create .gitignore if it doesn't exist
  if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}Creating .gitignore...${NC}"
    cp "${JEX_DIR}/templates/gitignore" .gitignore
  fi

  # Build image if it doesn't exist
  if ! docker image inspect $DOCKER_IMAGE >/dev/null 2>&1; then
    image_build
  fi

  # Create a new Jekyll site directly in the current directory
  # We'll run Jekyll as the current user to ensure correct file ownership
  USER_ID=$(id -u)
  GROUP_ID=$(id -g)

  run_cmd "docker run --rm -v $(pwd):/site -u $USER_ID:$GROUP_ID $DOCKER_IMAGE sh -c \"jekyll new . --force && bundle install\"" 

  # If files are still created as root, fix ownership
  if [ -f "_config.yml" ] && [ $(stat -c "%u" _config.yml) -ne $USER_ID ]; then
    echo -e "${YELLOW}Fixing file ownership...${NC}"
    run_cmd "sudo chown -R $USER_ID:$GROUP_ID ."
  fi

  echo -e "${GREEN}Jekyll project initialized successfully!${NC}"
  echo -e "${YELLOW}To start your Jekyll server, run:${NC}"
  echo -e "./jex.sh serve"
  echo -e "\n${GREEN}You can access your site at:${NC} http://localhost:${JEKYLL_PORT:-4000}"
}

# Create a new Jekyll post
function project_new_post() {
  if [ -z "$1" ]; then
    error_exit "Please provide a post title"
  fi

  # Format date and title for filename
  local date=$(date +%Y-%m-%d)
  local title_slug=$(echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
  local filename="_posts/$date-$title_slug.md"

  # Create _posts directory if it doesn't exist
  if [ ! -d "_posts" ]; then
    mkdir -p _posts
  fi

  # Create the post file with front matter
  echo -e "${BLUE}Creating new post: $filename${NC}"
  cat > "$filename" << EOF
---
layout: post
title: "$1"
date: $date $(date +%H:%M:%S) +0000
categories: blog
---

Write your post content here.
EOF

  echo -e "${GREEN}Post created successfully!${NC}"
  echo -e "${YELLOW}Edit this file: $filename${NC}"
}

# Install a new gem
function project_add_gem() {
  if [ -z "$1" ]; then
    error_exit "Please provide a gem name"
  fi

  echo -e "${BLUE}Adding gem: $1${NC}"
  container_exec "bundle add $1"
  echo -e "${GREEN}Gem added successfully!${NC}"
  echo -e "${YELLOW}Remember to restart your Jekyll server for changes to take effect.${NC}"
}

# Open Jekyll site in browser
function project_open() {
  echo -e "${BLUE}Opening Jekyll site in browser...${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:${JEKYLL_PORT:-4000}"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:${JEKYLL_PORT:-4000}"
  else
    echo -e "${YELLOW}Please open http://localhost:${JEKYLL_PORT:-4000} in your browser${NC}"
  fi
}

# ======================================================
# HELP & INFO DOMAIN
# ======================================================

# Display version information
function show_version() {
  echo -e "${BLUE}jex (Jekyll Execution Script) v${JEX_VERSION}${NC}"
  echo -e "A utility for managing Jekyll projects with Docker"
}

# Display help information
function show_help() {
  show_version
  echo -e "\n${BOLD}USAGE:${NC}"
  echo -e "  ./jex.sh [command] [args...]"

  echo -e "\n${BOLD}AVAILABLE COMMANDS:${NC}"
  echo -e "  ${GREEN}init${NC}               Initialize a new Jekyll project in current directory"
  echo -e "  ${GREEN}serve${NC}              Start Jekyll server with live reload"
  echo -e "  ${GREEN}serve-detached${NC}     Run Jekyll server in background"
  echo -e "  ${GREEN}stop${NC}               Stop detached Jekyll server"
  echo -e "  ${GREEN}new-post ${NC}\"Title\"    Create a new Jekyll post"
  echo -e "  ${GREEN}exec${NC} \"command\"     Execute a command inside the Jekyll container"
  echo -e "  ${GREEN}add-gem${NC} gem_name   Install a new gem"
  echo -e "  ${GREEN}open${NC}               Open Jekyll site in browser"
  echo -e "  ${GREEN}fix-permissions${NC}    Fix file permissions in the project"
  echo -e "  ${GREEN}build-image${NC}        Build the Jekyll Docker image"
  echo -e "  ${GREEN}clean${NC}              Clean up Jekyll Docker containers"
  echo -e "  ${GREEN}clean-all${NC}          Clean up all Jekyll Docker resources"
  echo -e "  ${GREEN}version${NC}            Show version information"
  echo -e "  ${GREEN}help${NC}               Display this help information"

  echo -e "\n${BOLD}EXAMPLES:${NC}"
  echo -e "  ./jex.sh init                 # Create a new Jekyll site"
  echo -e "  ./jex.sh new-post \"My Post\"   # Create a new blog post"
  echo -e "  ./jex.sh serve                # Start the Jekyll server"
  echo -e "  ./jex.sh exec \"bundle update\" # Run a command in the container"
}

# ======================================================
# MAIN EXECUTION
# ======================================================

# Ensure jex directory exists
ensure_jex_dir

# Load config
load_config

# Add fix-permissions command
function project_fix_permissions() {
  fix_permissions "${1:-.}"
}

# Parse command
COMMAND=$1
shift || true

case $COMMAND in
  # Image domain
  "build-image")
    image_build
    ;;

  # Container domain
  "serve")
    container_serve
    ;;
  "serve-detached")
    container_serve_detached
    ;;
  "stop")
    container_stop
    ;;
  "exec")
    container_exec "$*"
    ;;

  # Project domain
  "init")
    project_init
    ;;
  "new-post")
    project_new_post "$*"
    ;;
  "add-gem")
    project_add_gem "$1"
    ;;
  "open")
    project_open
    ;;
  "fix-permissions")
    project_fix_permissions "$1"
    ;;

  # Cleanup
  "clean")
    container_clean
    ;;
  "clean-all")
    container_clean
    image_remove
    ;;

  # Help and info
  "version")
    show_version
    ;;
  "help"|"--help"|"-h"|"")
    show_help
    ;;
  *)
    error_exit "Unknown command: $COMMAND\nRun './jex.sh help' to see available commands."
    ;;
esac

exit 0
