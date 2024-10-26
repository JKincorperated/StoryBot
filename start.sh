#!/bin/bash

HASH=$(git rev-parse HEAD)
git fetch --all
NEWEST_HASH=$(git rev-parse `git branch -r --sort=committerdate | tail -1`)
echo "Current commit hash: $NEWEST_HASH"
echo "Local commit hash: $HASH"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

if [ "$HASH" != "$NEWEST_HASH" ]; then
    echo "Updating from github"
    git pull
    echo "Installing npm packages"
    npm install
    echo "Building project"
    npm run build
fi


echo "Starting server"
npm run start
