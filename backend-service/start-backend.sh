#!/bin/bash

# CloudSecureAI Backend Startup Script
# This script starts the backend server with proper configuration

echo "======================================"
echo "  CloudSecureAI Backend Server"
echo "======================================"
echo ""

# Check if EMAIL_PASSWORD is set
if [ -z "$EMAIL_PASSWORD" ]; then
    echo "⚠️  WARNING: EMAIL_PASSWORD environment variable is NOT set!"
    echo "   Email functionality will NOT work."
    echo ""
    echo "   To set it, run:"
    echo "   export EMAIL_PASSWORD=\"your-outlook-app-password\""
    echo ""
    echo "   Get app password from: https://account.microsoft.com/security"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ EMAIL_PASSWORD is set"
fi

echo ""
echo "Starting backend server..."
echo "Press Ctrl+C to stop"
echo ""

# Start the backend (skip tests to avoid compilation errors)
mvn spring-boot:run -DskipTests

