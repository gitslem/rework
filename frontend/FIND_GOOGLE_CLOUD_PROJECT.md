# How to Find Your Firebase Project in Google Cloud Console

## 🎯 The Issue

You created a Firebase project, but when you go to Google Cloud Console, you don't see it. **The project exists** - you just need to access it correctly.

---

## ✅ METHOD 1: Direct Link from Firebase (EASIEST)

This is the **fastest and most reliable** way:

### Step-by-Step:

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/
   ```

2. **Select your project** (click on the project card)

3. **Open Project Settings:**
   - Click the **gear icon ⚙️** next to "Project Overview" (top left)
   - Click **"Project settings"**

4. **Find the Google Cloud link:**
   - Scroll down to **"Your apps"** section
   - OR look for **"Service accounts"** tab at the top
   - Click **"Google Cloud Console"** or **"Manage service accounts"** link

   **This will open your project in Google Cloud Console automatically!** ✅

5. **Bookmark this page** so you can return easily

---

## ✅ METHOD 2: Use Project ID

Every Firebase project has a unique Project ID. Use it to access Google Cloud directly:

### Step-by-Step:

1. **Get your Firebase Project ID:**
   - Go to Firebase Console: https://console.firebase.google.com/
   - Select your project
   - Look at the URL - it contains your project ID:
     ```
     https://console.firebase.google.com/project/YOUR-PROJECT-ID/
                                                    ↑ This is your Project ID
     ```
   - OR click ⚙️ → Project settings → Find "Project ID"

2. **Copy the Project ID** (e.g., "remote-works-abc123")

3. **Access directly in Google Cloud:**
   - Go to: https://console.cloud.google.com/
   - Click the project selector at the top (says "Select a project")
   - Type your Project ID in the search box
   - Click on your project when it appears

---

## ✅ METHOD 3: Check Account and Organization

Sometimes the project is hidden due to account or organization settings:

### Step-by-Step:

1. **Verify your Google account:**
   - In Google Cloud Console, check the account icon (top-right)
   - Make sure you're logged in with the **same email** you use for Firebase
   - If not, click the account icon → **Add another account** or switch accounts

2. **Check the project selector:**
   - Click the project dropdown at the top
   - Look for tabs: **RECENT**, **ALL**, **STARRED**
   - Switch to **ALL** tab to see all projects
   - Search for your project name or ID

3. **Check for organization filter:**
   - In the project selector, look for organization filter at the top
   - Try changing to "No organization" or your organization name

---

## ✅ METHOD 4: Direct URL (If You Know Project ID)

If you know your Firebase Project ID, you can access Google Cloud directly:

### URL Format:
```
https://console.cloud.google.com/apis/credentials?project=YOUR-PROJECT-ID
```

### Example:
If your Project ID is `remote-works-abc123`:
```
https://console.cloud.google.com/apis/credentials?project=remote-works-abc123
```

This takes you **directly** to the Credentials page of your project!

---

## 🔍 Common Reasons Why You Don't See Your Project

### 1. **Different Google Account**
   - **Issue:** Firebase uses account A, you're logged into Google Cloud with account B
   - **Fix:** Switch accounts in Google Cloud to match Firebase

### 2. **Project in Different Organization**
   - **Issue:** Project belongs to an organization, you're viewing personal projects
   - **Fix:** Change organization filter in project selector

### 3. **Recently Created Project**
   - **Issue:** Project was just created (less than 5 minutes ago)
   - **Fix:** Wait a few minutes and refresh

### 4. **Insufficient Permissions**
   - **Issue:** You have limited access to the project
   - **Fix:** Ask project owner to grant you "Editor" or "Owner" role

### 5. **Deleted Project**
   - **Issue:** Project was deleted or suspended
   - **Fix:** Check Firebase Console - if project shows there, it's not deleted

---

## 📝 What You Need to Find

Once you access your project in Google Cloud, you need to:

### 1. Navigate to Credentials:
```
☰ Menu (top-left) → APIs & Services → Credentials
```

### 2. Find the OAuth Client:
Look for:
- **"Web client (auto created by Google Service)"**
- Client ID ends with `.apps.googleusercontent.com`

### 3. Edit and Add Redirect URIs:
Click the pencil icon ✏️ and add:
```
Authorized redirect URIs:
→ http://localhost:3000/__/auth/handler
→ https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler
```

---

## 🆘 Still Can't Find Your Project?

### Try This Diagnostic:

1. **In Firebase Console:**
   ```
   - Click ⚙️ → Project settings
   - Copy the "Project ID"
   - Copy the "Project number"
   ```

2. **In Google Cloud Console:**
   ```
   - Click project selector dropdown
   - Click "ALL" tab
   - Search using BOTH:
     • Project ID
     • Project number
   ```

3. **Use Firebase's built-in link:**
   ```
   - Firebase Console → ⚙️ → Project settings
   - Click "Service accounts" tab
   - Click "Manage service account permissions"
   - This MUST open Google Cloud with your project
   ```

---

## 🎯 Quick Checklist

Before proceeding, verify:

- [ ] I'm using the same Google account in both consoles
- [ ] I've tried the direct link from Firebase → Project Settings
- [ ] I've searched for my Project ID in Google Cloud project selector
- [ ] I've checked the "ALL" tab in the project selector
- [ ] I've waited at least 5 minutes if project was just created
- [ ] I can see my project in Firebase Console (so it's not deleted)

---

## 💡 Pro Tip: Get Direct Access URL

Once you find your project in Google Cloud:

1. **Note your Project ID** from Firebase Console
2. **Bookmark this URL:**
   ```
   https://console.cloud.google.com/apis/credentials?project=YOUR-PROJECT-ID
   ```
   Replace `YOUR-PROJECT-ID` with your actual project ID

3. **This URL always takes you directly to OAuth settings** for your project!

---

## 📞 Need More Help?

If you still can't find your project:

1. **Check Firebase Project Settings:**
   - Make sure your Firebase project is active
   - Verify you have access (owner/editor role)

2. **Try Firebase Support:**
   - Firebase Console → ? icon → Contact support
   - Describe: "Can't find Firebase project in Google Cloud Console"

3. **Share these details:**
   - Firebase Project ID: _____________
   - Firebase Project Name: _____________
   - Your Google account email: _____________
   - Error message (if any): _____________

---

**Last Updated:** 2025-11-29
