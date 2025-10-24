#!/bin/sh

# This script installs necessary dependencies for a project, generates the prisma client and migrates the database, before starting up. The project directory, path depends on the project path.
set -e

# Check if project path exists
if [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Project directory '$PROJECT_PATH' does not exist"
    exit 1
fi


cd /app/project

# background sync.
while true; do
    rsync -a --exclude 'node_modules' ${PROJECT_PATH}/ /app/project
    # Install dependencies only if package.json has changed
    if [ -f "package.json" ]; then
        CHECKSUM_FILE="node_modules/.package-json.md5"
        NEEDS_INSTALL=false

        if [ ! -f "$CHECKSUM_FILE" ]; then
            NEEDS_INSTALL=true
            echo "Checksum file not found. Dependencies will be installed."
        else
            OLD_CHECKSUM=$(cat "$CHECKSUM_FILE")
            NEW_CHECKSUM=$(openssl md5 -r package.json | awk '{print $1}')
            if [ "$OLD_CHECKSUM" != "$NEW_CHECKSUM" ]; then
                NEEDS_INSTALL=true
                echo "package.json has changed. Dependencies will be installed."
            else
                echo "package.json has not changed. Skipping dependency installation."
            fi
        fi

        if [ "$NEEDS_INSTALL" = true ]; then
            CI=true pnpm install
            openssl md5 -r package.json | awk '{print $1}' > "$CHECKSUM_FILE"
        fi
    else
        CI=true pnpm install
    fi
  sleep 30
done &

# Install dependencies
pnpm install

# If we have a start command in environment variable, use it instead of dev
if [ -n "$START_COMMAND" ]; then
    $START_COMMAND
else
    pnpm dev
fi