# 🏡 Household Turn Organizer — Setup & Guide

A unified mobile-first household manager for **Raghav, Ritish, Navneet, Japesh, Akash, Satnam, Vaibhav, Sourab, and Abhi**.

---

## 🌟 Key Features & Updates

1. **🔐 Admin Password Protection (`4042admin`):**
   - Switching to **Satnam** or **Sourab** in the dropdown requires the admin password: `4042admin`.
   - If incorrect or cancelled, access is blocked and the user is reverted to a roommate profile.
   - Admin privileges unlock the **⚙️ Admin & Backend** panel and turn override controls.
   - Includes a quick **Lock** button in the header pill to lock the admin session on shared devices.

2. **📡 Live DB Connection Status Badge:**
   - Prominently displayed in the top header:
     - 🟢 **Live Cloud Sync (Connected):** Realtime multi-device database active.
     - 🟡 **Connecting to Firebase…:** Initializing anonymous auth and cloud handshake.
     - 🔴 **Offline / Local Mode:** Graceful local fallback if offline.
   - Admin panel includes a **Force Resync with Database** button to refresh live state.

3. **☁️ End-to-End Database Storage:**
   - **Milk Turn:** Rotation order, next index, cycle count, cycle history.
   - **Cleaning Duty:** Weekly cleaning schedule (Navneet & Japesh excluded).
   - **Garbage Day:** Wednesday collection rotation (Navneet & Japesh paired).
   - **Roommate Emails:** Saved in `/milkTurnOrganizer/state/emails` on first name selection.
   - **Exchange Requests & History:** Swaps, completions, skips, and activity logs are all synchronized in real-time across everyone's devices.

4. **👥 Navneet & Japesh Pairing:**
   - Paired together as **Navneet & Japesh** for **Milk Turn** and **Garbage Day**.
   - Excluded from the **Cleaning Duty** table.

5. **📧 2-Day Advance Personal Gmail Reminders:**
   - Automation script in `automation/Code.gs` runs for free in Satnam's Google Account.
   - **Garbage Day:** Reminders sent every **Monday** morning (2 days before Wednesday collection).
   - **Cleaning Duty:** Reminders sent every **Friday** morning (2 days before Sunday cleaning).

---

## 🚀 How to Deploy to GitHub Pages (Ready to Deploy!)

The project is **100% ready for GitHub Pages**. It is a zero-build, static web app using CDN-hosted Firebase modules.

### Steps to Deploy:
1. **Commit and push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Add admin password, 3 sections, live DB status and email automation"
   git push origin main
   ```
2. **Enable GitHub Pages:**
   - Go to your repository on GitHub.
   - Click **Settings** (top tab) &rarr; **Pages** (left sidebar).
   - Under **Build and deployment**:
     - **Source:** Select `Deploy from a branch`.
     - **Branch:** Select `main` and folder `/(root)`.
   - Click **Save**.
3. **Open the live link:**
   - In 1–2 minutes, GitHub will show: `"Your site is live at https://<username>.github.io/<repo-name>/"`.
   - Share this exact link with all roommates!

---

## 🛠️ Step-by-Step Personal Gmail Automation Setup

You do not need to pay for any server. Google Apps Script runs directly inside your Google Account for free and sends emails from your personal `@gmail.com` address.

### Step 1: Open Google Apps Script
1. Go to [script.google.com](https://script.google.com/) and log in with your personal Google account.
2. Click **New project** (name it `Household Duty Reminders`).

### Step 2: Paste the Automation Code
1. Open the file `automation/Code.gs` in this repository.
2. Copy the entire content and paste it into the Apps Script editor (replacing `myFunction`).
3. Click **Save** (💾).

### Step 3: Test and Authorize
1. In the toolbar, select the function `sendDailyReminders`.
2. Click **Run**.
3. Google will ask for permission to access Gmail and fetch external URLs (Firebase).
4. Click **Review permissions** &rarr; select your Google account &rarr; click **Advanced** &rarr; **Go to Household Duty Reminders (unsafe)** &rarr; **Allow**.

### Step 4: Set the Daily Schedule Trigger
1. On the left sidebar of Apps Script, click the clock icon (⏱️ **Triggers**).
2. Click **Add Trigger** (bottom right).
3. Configure the trigger:
   - **Choose which function to run:** `sendDailyReminders`
   - **Select event source:** `Time-driven`
   - **Select type of time based trigger:** `Day timer`
   - **Select time of day:** `8am to 9am` (or your preferred morning hour).
4. Click **Save**.

---

## 🔒 Firebase Realtime Database Rules

In the Firebase Console under **Realtime Database &rarr; Rules**, verify your rules:

```json
{
  "rules": {
    "milkTurnOrganizer": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```
*(Anonymous authentication is pre-configured in `index.html`, allowing seamless multi-device syncing while securing the database).*

---

## 📱 Adding to Phone Home Screen

- **iPhone (Safari):** Open web app &rarr; Tap Share icon &rarr; Tap **Add to Home Screen**.
- **Android (Chrome):** Open web app &rarr; Tap 3-dot menu &rarr; Tap **Add to Home screen** / **Install app**.
