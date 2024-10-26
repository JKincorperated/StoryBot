#!/bin/bash

HASH=$(git rev-parse HEAD)
LOCAL_HASH=$(cat .git/refs/heads/main)
echo "Current commit hash: $HASH"
echo "Local commit hash: $LOCAL_HASH"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

if [ "$HASH" != "$LOCAL_HASH" ]; then
    echo "Updating from github"
    git pull
    echo "Installing npm packages"
    npm install
    echo "Building project"
    npm run build
fi

echo "Starting server"
npm run start
