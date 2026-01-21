#!/bin/bash

# EAS Build hook to increment build number before building
# This runs automatically before each EAS build

echo "🔢 Incrementing build number..."

# Run the increment script
node scripts/increment-build.js

echo "✅ Build number incremented successfully"
