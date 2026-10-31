/**
 * =========================================================================
 * Household Duties Email Automation — Google Apps Script
 * =========================================================================
 * Runs automatically every day in Satnam's Google Account for free.
 * Sends emails from Satnam's personal Gmail directly to roommates!
 *
 * SCHEDULE:
 * - Garbage Day is every Wednesday: Reminders sent 2 days before (Monday morning).
 * - Cleaning Duty is every Sunday: Reminders sent 2 days before (Friday morning).
 * - Milk Turn: Reminders sent when someone's turn is active or on demand.
 * =========================================================================
 */

// Your Firebase Database URL (public read or secret/token if rules locked)
const FIREBASE_DB_URL = "https://milk-organizer-default-rtdb.firebaseio.com/milkTurnOrganizer/state.json";

/**
 * Main Daily Trigger Function:
 * Run this function once per day between 8:00 AM - 9:00 AM.
 */
function sendDailyReminders() {
  const data = getFirebaseData();
  if (!data) {
    Logger.log("Could not load Firebase data.");
    return;
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat

  Logger.log("Running daily reminders for day of week: " + dayOfWeek + " (" + today.toDateString() + ")");

  // 1. GARBAGE DAY: Every Wednesday -> Reminder 2 days before is MONDAY (dayOfWeek === 1)
  if (dayOfWeek === 1) {
    handleGarbageReminder(data);
  }

  // 2. CLEANING DUTY: Scheduled for Sunday -> Reminder 2 days before is FRIDAY (dayOfWeek === 5)
  if (dayOfWeek === 5) {
    handleCleaningReminder(data);
  }
}

/**
 * Handle Garbage Day reminder (Sent on Monday for Wednesday's collection)
 */
function handleGarbageReminder(data) {
  const garbage = data.garbage || {};
  const emails = data.emails || {};
  const order = garbage.order || [];
  const nextIndex = garbage.nextIndex || 0;

  if (order.length === 0) return;
  const person = order[nextIndex % order.length];
  const targetEmails = getEmailsForPerson(person, emails);

  if (targetEmails.length === 0) {
    Logger.log("No email found for Garbage Duty person: " + person);
    return;
  }

  // Calculate upcoming Wednesday date
  const nextWed = getNextDayOfWeek(3); // 3 = Wednesday
  const dateStr = nextWed.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });

  const subject = "🗑️ Household Reminder: Your Garbage Duty is this Wednesday (" + dateStr + ")";
  const body = 
`Hi ${person},

Friendly household reminder: It's your turn for Garbage Day this week on ${dateStr} (in 2 days)!

Please ensure:
• All trash and recycling bins are pulled out to the curb Tuesday night or Wednesday morning.
• Bins are brought back after collection.

Once done, you can mark it as completed on the household web app.
If you need to swap turns, please coordinate with a roommate through the app.

Thanks!
Household Organizer (Automated reminder from Satnam)`;

  sendToAll(targetEmails, subject, body);
}

/**
 * Handle Cleaning Duty reminder (Sent on Friday for Sunday's cleaning)
 */
function handleCleaningReminder(data) {
  const cleaning = data.cleaning || {};
  const emails = data.emails || {};
  const order = cleaning.order || [];
  const nextIndex = cleaning.nextIndex || 0;

  if (order.length === 0) return;
  const person = order[nextIndex % order.length];
  const targetEmails = getEmailsForPerson(person, emails);

  if (targetEmails.length === 0) {
    Logger.log("No email found for Cleaning Duty person: " + person);
    return;
  }

  const nextSun = getNextDayOfWeek(0); // 0 = Sunday
  const dateStr = nextSun.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });

  const subject = "🧹 Household Reminder: Your Cleaning Duty is this Sunday (" + dateStr + ")";
  const body = 
`Hi ${person},

Friendly household reminder: You are scheduled for Cleaning Duty this weekend on ${dateStr} (in 2 days)!

Please take care of:
• Kitchen countertops & stove
• Common living area & floors
• Trash cans & shared spaces

Thank you for keeping the house clean for everyone!

Thanks!
Household Organizer (Automated reminder from Satnam)`;

  sendToAll(targetEmails, subject, body);
}

/**
 * Webhook handler for instant 1-click reminders from the web app
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { section, person, email, customMessage } = payload;

    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No recipient email provided" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    let subject = "📢 Household Turn Reminder: " + section;
    let body = `Hi ${person},\n\nThis is a friendly reminder that you have an upcoming turn for ${section} in our shared household.\n\n${customMessage || "Please check the app to see details or mark your turn as done."}\n\nThanks!\nHousehold Organizer`;

    if (section === "Milk Turn") {
      subject = "🥛 Reminder: It is your turn to buy Milk!";
      body = `Hi ${person},\n\nFriendly reminder: You are up next on the Milk Turn!\nPlease pick up milk for the house when you can and mark it done on the web app.\n\nThanks!\nHousehold Organizer`;
    } else if (section === "Garbage Day") {
      subject = "🗑️ Reminder: Garbage Day Duty this week!";
    } else if (section === "Cleaning Duty") {
      subject = "🧹 Reminder: Cleaning Duty turn!";
    }

    GmailApp.sendEmail(email, subject, body);

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Email sent successfully to " + email }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Household Email Automation Webhook is Active! Use POST with {section, person, email} to trigger an email.");
}

// ---------------- Helper Utilities ----------------

function getFirebaseData() {
  try {
    const response = UrlFetchApp.fetch(FIREBASE_DB_URL, { muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      return JSON.parse(response.getContentText());
    }
  } catch (e) {
    Logger.log("Error fetching Firebase: " + e);
  }
  return null;
}

function getEmailsForPerson(person, emails) {
  const result = [];
  if (emails[person]) result.push(emails[person]);
  
  // Handle paired names like "Navneet & Japesh"
  if (person.includes("&")) {
    const parts = person.split("&").map(p => p.trim());
    for (const p of parts) {
      if (emails[p] && !result.includes(emails[p])) {
        result.push(emails[p]);
      }
    }
  }
  return result;
}

function sendToAll(emailList, subject, body) {
  emailList.forEach(email => {
    try {
      Logger.log("Sending email to: " + email);
      GmailApp.sendEmail(email, subject, body);
    } catch (err) {
      Logger.log("Failed to send email to " + email + ": " + err);
    }
  });
}

function getNextDayOfWeek(targetDay) {
  const d = new Date();
  const currentDay = d.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  const targetDate = new Date(d);
  targetDate.setDate(d.getDate() + diff);
  return targetDate;
}
