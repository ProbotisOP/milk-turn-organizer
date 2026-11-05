# 🏡 Household Turn Organizer — Setup & Guide

A unified mobile-first household manager for **Raghav, Ritish, Navneet, Japesh, Akash, Satnam, Vaibhav, Sourab, and Abhi** (with full admin capability to add/edit/manage any household member).

---

## 🌟 Key Features & Updates

1. **👥 Database-Synced People & Member Management:**
   - **Unified People List:** The top "I am [Name]" dropdown is dynamically linked to the household member list in Firebase DB.
   - **Full Admin Control:** Admins can add new people, edit/rename existing members, grant or revoke Admin privileges, set duty participation (🥛 Milk, 🧹 Cleaning, 🗑️ Garbage), and remove people with full cloud synchronization.
   - **Direct Header Integration:** Admins can click `+ Person` or choose `➕ Add New Person…` straight from the dropdown.

2. **📅 Full Admin Scheduling Control with 5 Distinct Modes:**
   - **Mode 1: 📌 Recurring Occurrence Rules:**
     - Configure occurrence rules: e.g., every **8th** of the month is assigned to **Satnam**, every **12th** is assigned to **Sourab**, or weekly day of week (e.g. every Sunday or Wednesday).
     - Upcoming duties queue lists occurrences generated from recurring rules in chronological order.
   - **Mode 2: ⏱️ Time-Based Interval Cadence:**
     - Sequential turn rotation that continues every N days (e.g., after **4 days** or **5 days** continue rotation through roommates).
     - Quick cadence buttons: 3 days, 4 days, 5 days, 7 days.
   - **Mode 3: 🔀 Person Chain ("After-Turn" Succession):**
     - Custom successor chain: e.g., **after Satnam is Saurab, then Abhi, etc.**
     - Admins can customize the exact succession order and set individual turn duration (days) for each roommate.
   - **Mode 4: 🔗 Linked Duty Schedule Synchronization:**
     - Automatically link a duty schedule with another duty: e.g., **Cleaning Duty schedule linked to Garbage Day**.
     - When Garbage Day advances or changes, Cleaning Duty automatically mirrors the assigned roommate in real time!
   - **Mode 5: 📅 Specific Calendar Dates:**
     - Explicitly assign specific calendar dates to roommates.
   - **Instant Save & Apply to Duties:**
     - Admins select any of the 5 modes and click **💾 Save & Apply Schedule to Duties**.
     - Duties list updates immediately on screen within 0ms and syncs to Firebase Realtime Database in the background.
   - **Inline Turn Reassignment & Rearrangement:**
     - Admins can change who does ANY turn directly on the schedule cards using the **`⇄ Change`** button (e.g. change the 8th from Satnam to anyone!).
     - Choose whether changes apply to **that specific date only**, update the **recurring rule**, or **swap rotation positions**.
     - Overridden turns feature a quick **`✕ Revert`** button to restore standard rotation.
     - Rearrange turns anytime with **▲ Move Up**, **▼ Move Down**, or **☰ Drag & Drop**.

3. **🔐 Admin Password Protection (`4042admin`):**
   - Switching to **Satnam**, **Sourab**, or any designated admin in the dropdown requires the admin password: `4042admin`.
   - Admin privileges unlock the **⚙️ Admin & Backend** panel, schedule configuration, people manager, and turn override controls.
   - Quick **Lock** button in the header to safely close admin sessions on shared devices.

4. **📡 Live DB Connection Status Badge:**
   - Prominently displayed in the top header:
     - 🟢 **Live Cloud Sync (Connected):** Realtime multi-device database active.
     - 🟡 **Connecting to Firebase…:** Initializing anonymous auth and cloud handshake.
     - 🔴 **Offline / Local Mode:** Graceful local fallback if offline.

5. **📧 2-Day Advance Personal Gmail Reminders:**
   - Automation script in `automation/Code.gs` runs for free in Satnam's Google Account.
   - **Garbage Day:** Reminders sent every **Monday** morning (2 days before Wednesday collection).
   - **Cleaning Duty:** Reminders sent every **Friday** morning (2 days before Sunday cleaning).
   - **Milk Turn:** 2-day advance check and real-time reminders.
   - Supports date overrides and recurring scheduling rules.

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
