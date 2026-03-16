# Reminder App - ngrok Setup Guide

## 🚀 **ngrok Setup for External Access**

### **Step 1: Install ngrok**

```bash
# Download ngrok (Linux)
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
chmod +x ngrok

# Or download directly
curl -O https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
chmod +x ngrok

# Move to system path (optional)
sudo mv ngrok /usr/local/bin/
```

### **Step 2: Start Your App**

```bash
# Navigate to your app directory
cd reminder-app

# Install dependencies if not already installed
npm install

# Start the React development server
npm start
```

### **Step 3: Start ngrok Tunnel**

```bash
# In a NEW terminal window (don't close your app!)
# Navigate to where you installed ngrok
cd /path/to/ngrok

# Start ngrok tunnel to port 3000
./ngrok http 3000
```

### **Step 4: Access Your App**

After running the ngrok command, you'll see output like this:

```
ngrok by @inconshreveable

Session Status                online
Account                       Your Name (Plan: Free)
Version                       x.x.x
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://abc123.ngrok.io -> http://localhost:3000
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Access your app at:** `http://abc123.ngrok.io` or `https://abc123.ngrok.io`

## 🔧 **Troubleshooting**

### **Common Issues**

**Port already in use:**
```bash
# Kill processes on port 3000
kill -9 $(lsof -t -i:3000)

# Or try a different port
./ngrok http 3001
```

**ngrok not found:**
```bash
# Check if ngrok is in your current directory
ls -la | grep ngrok

# Or add to system path
export PATH=$PATH:/path/to/ngrok
```

**Network blocked:**
- Check if your network allows outbound connections to ngrok
- Try using a different network if possible

### **Advanced Options**

**Custom subdomain (paid feature):**
```bash
# With authtoken (if you have an account)
./ngrok http -subdomain=myapp 3000
```

**Custom region:**
```bash
# Use a different region (us, eu, ap, au, sa, jp, in)
./ngrok http -region=eu 3000
```

**Inspect traffic:**
```bash
# Open ngrok web interface
http://127.0.0.1:4040
```

## 📊 **Testing Your Public App**

Once you have the ngrok URL, test:

1. **Basic Functionality**
   - [ ] App loads at public URL
   - [ ] All buttons and links work
   - [ ] Forms submit correctly
   - [ ] Navigation between views

2. **Core Features**
   - [ ] Add new reminder works
   - [ ] Reminders display correctly
   - [ ] Complete/delete/snooze actions work
   - [ ] Data persists between sessions

3. **Performance**
   - [ ] Page loads within 2-3 seconds
   - [ ] Interactions are responsive
   - [ ] No console errors

## 🔒 **Security Tips**

**For Public Testing:**
- ngrok URLs are public by default - anyone can access them
- Consider adding basic authentication to your app
- Don't share sensitive data during testing
- Use HTTPS (ngrok provides this automatically)

**To Add Basic Auth (Optional):**
```bash
# In your app, add a simple login screen
# Or use ngrok's built-in authentication
./ngrok http -auth="user:password" 3000
```

## 📋 **Quick Reference Commands**

```bash
# Install ngrok
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip && unzip ngrok-stable-linux-amd64.zip && chmod +x ngrok

# Start app
cd reminder-app && npm install && npm start

# Start ngrok tunnel
./ngrok http 3000

# Check ngrok status
http://127.0.0.1:4040
```

## 🎯 **Next Steps**

1. Run the installation commands
2. Start your app
3. Start ngrok tunnel
4. Test the public URL
5. Verify all functionality works

**You should now be able to access your reminder app from any device with internet connection!**

## 💡 **Pro Tips**

- **Keep the ngrok window open** - if you close it, the tunnel stops
- **URLs change** - each ngrok session gets a new random URL
- **Use HTTPS** - ngrok provides secure HTTPS by default
- **Traffic inspection** - use http://127.0.0.1:4040 to see all requests
- **Custom domains** - available with paid ngrok accounts
- **Multiple tunnels** - you can run multiple ngrok instances for different ports

## 📞 **Need Help?**

If you encounter issues:
1. Check if port 3000 is available
2. Verify ngrok is installed correctly
3. Ensure your app is running on localhost:3000
4. Check network firewall settings
5. Try a different ngrok region if connection is slow

Once set up, share the ngrok URL with anyone you want to test with!