# Reminder App - Testing Guide

## 🧪 **Quick Start Testing**

Since you cannot access my container directly, here's how to test the reminder app locally:

### **Prerequisites**
- Node.js and npm installed on your machine
- Git (if cloning from repository)

### **Step 1: Setup the App**

```bash
# Clone or download the app files
# Navigate to the reminder-app directory
cd reminder-app

# Install all dependencies
npm install
```

### **Step 2: Start the Development Server**

```bash
# Start the React development server
npm start
```

This will:
- Start a development server on `http://localhost:3000`
- Open your default browser automatically
- Enable hot reloading (changes update automatically)

### **Step 3: Test Core Functionality**

#### **Basic Tests**
1. **Add a New Reminder**
   - Click "+ New Reminder"
   - Fill in title, description, due date
   - Set priority and repeat options
   - Click "Create Reminder"

2. **View Reminders**
   - Check calendar view for visual indicators
   - Switch to list view to see all reminders
   - Verify reminder appears in both views

3. **Complete a Reminder**
   - Click the checkmark icon on any reminder
   - Verify it moves to completed state
   - Check visual changes (green background)

4. **Snooze a Reminder**
   - Click the snooze icon on an active reminder
   - Test different snooze durations
   - Verify due date updates correctly

5. **Edit a Reminder**
   - Click to edit any reminder
   - Modify fields and save changes
   - Verify updates persist

6. **Delete a Reminder**
   - Click delete icon on any reminder
   - Confirm deletion
   - Verify it's removed from list

### **Advanced Tests**

#### **Database Persistence**
- Add reminders, close browser, reopen
- Refresh page and verify data remains
- Test multiple reminders at once

#### **Filtering & Sorting**
- Filter by completed status
- Filter by upcoming/overdue
- Sort by due date, creation date, completion

#### **UI/UX Tests**
- Test responsive design on different screen sizes
- Verify loading states and error handling
- Test navigation between calendar and list views

## 🔍 **What to Look For**

### **Expected Behavior**
- App loads without errors
- All buttons and links are functional
- Forms validate input correctly
- Data persists in browser storage
- Navigation works smoothly
- Visual indicators show reminder counts

### **Common Issues to Watch For**
- Console errors (check browser DevTools)
- Form validation not working
- Database operations failing
- Navigation not updating correctly
- Styling issues on different screens

### **Performance Indicators**
- App loads within 2-3 seconds
- Interactions are responsive (<300ms)
- No memory leaks or high CPU usage
- Smooth animations and transitions

## 🛠️ **Troubleshooting**

### **If App Doesn't Start**
```bash
# Check if port 3000 is available
# Try different port
PORT=3001 npm start

# Check Node.js/npm installation
node --version
npm --version

# Clear npm cache
npm cache clean --force
```

### **If Dependencies Fail**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check package.json for correct dependencies
```

### **If Database Issues**
- Clear browser storage and test again
- Check IndexedDB permissions
- Verify database initialization

## 📊 **Testing Checklist**

### **Core Functionality**
- [ ] App loads successfully
- [ ] Add reminder form works
- [ ] Reminders display correctly
- [ ] Complete/delete/snooze actions work
- [ ] Data persists between sessions

### **UI/UX**
- [ ] Navigation works
- [ ] Calendar view shows indicators
- [ ] Responsive design
- [ ] Loading states display
- [ ] Error handling works

### **Advanced Features**
- [ ] Filtering by status
- [ ] Sorting options
- [ ] Snooze with custom durations
- [ ] Edit functionality
- [ ] Form validation

## 📋 **Next Steps**

Once testing is complete:
1. Verify all core features work as expected
2. Test edge cases and error handling
3. Check responsive design on different devices
4. Document any issues found
5. Consider mobile testing if needed

## 🔗 **Additional Resources**

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Create React App Guide](https://create-react-app.dev/docs/getting-started/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [IndexedDB Browser Support](https://caniuse.com/indexeddb)

**Note:** The app uses modern web technologies and should work on all current browsers (Chrome, Firefox, Safari, Edge). If you encounter issues, please check browser compatibility or try a different browser.