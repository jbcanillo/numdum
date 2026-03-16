#!/bin/bash

echo "🚀 Starting Reminder App..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Start the app
echo "🚀 Starting React development server..."
npm start &
APP_PID=$!

# Wait a few seconds for the app to start
echo "⏳ Waiting for app to start..."
sleep 5

# Check if app is running
echo "🔍 Checking if app is running..."
if ps -p $APP_PID > /dev/null; then
    echo "✅ App is running on http://localhost:3000"
else
    echo "❌ Failed to start app"
    exit 1
fi

echo ""
echo "🎯 Your reminder app is now running!"
echo "📍 Access it at: http://localhost:3000"
echo ""
echo "🔄 To test externally, run:"
echo "  ./ngrok http 3000"
echo ""
echo "💡 Pro Tips:"
echo "- Keep this terminal open to keep the app running"
echo "- Use http://localhost:3000 for local testing"
echo "- Use ngrok for external access"
echo "- Check http://localhost:4040 for ngrok traffic inspection"
echo ""
echo "🚀 Happy testing!"