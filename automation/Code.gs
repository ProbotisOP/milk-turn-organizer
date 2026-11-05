/**
 * =========================================================================
 * Household Duties Email Automation — Google Apps Script
 * =========================================================================
 * Runs automatically every day in Satnam's Google Account for free.
 * Sends emails from Satnam's personal Gmail directly to roommates!
 *
 * All emails are prefixed with [4042] in the subject heading.
 *
 * SCHEDULE:
 * - Garbage Day is every Wednesday: Reminders sent 2 days before (Monday morning).
 * - Cleaning Duty is every Sunday: Reminders sent 2 days before (Friday morning).
 * - Milk Turn: Reminders sent when someone's turn is active or on demand.
 * - Skip Turn & Exchange Alerts: Sent immediately to next person and Admins.
 * =========================================================================
 */

// Your Firebase Database URL (public read or authenticated)
const FIREBASE_DB_URL = "https://milk-organizer-default-rtdb.firebaseio.com/milkTurnOrganizer/state.json";

/**
 * Main Daily Trigger Function:
 * Set a trigger in Apps Script to run this once per day between 7:00 AM - 8:00 AM.
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

  // 3. MILK TURN: Check if someone has a turn in 2 days (e.g. 8th or interval)
  handleMilkReminder(data);
}

/**
 * Handle Milk Turn Reminder (2-day advance check)
 */
function handleMilkReminder(data) {
  const milk = data.milk || {};
  const emails = data.emails || {};
  const order = milk.order || [];
  const sched = milk.scheduling || {};
  if (order.length === 0) return;

  // In 2 days date
  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  const y = inTwoDays.getFullYear();
  const m = String(inTwoDays.getMonth() + 1).padStart(2, '0');
  const d = String(inTwoDays.getDate()).padStart(2, '0');
  const dateKey = `${y}-${m}-${d}`;
  const dayOfMonth = inTwoDays.getDate();

  let targetPerson = null;
  if (sched.dateOverrides && sched.dateOverrides[dateKey]) {
    targetPerson = sched.dateOverrides[dateKey];
  } else if (Array.isArray(sched.recurringRules)) {
    const monthRule = sched.recurringRules.find(r => r.type === "day_of_month" && Number(r.day) === dayOfMonth);
    if (monthRule) targetPerson = monthRule.person;
  }

  if (targetPerson) {
    const targetEmails = getEmailsForPerson(targetPerson, emails);
    if (targetEmails.length > 0) {
      const dateStr = inTwoDays.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });
      const subject = `[4042] [Milk Turn] Household Reminder: Your turn to buy Milk is on ${dateStr}`;
      const body = `Hi ${targetPerson},\n\nFriendly reminder: You are scheduled for the Milk Turn in 2 days on ${dateStr}!\n\nPlease pick up milk for the household and mark it as completed on the web app when done.\n\nThanks!\nHousehold Organizer (Satnam)`;
      sendToAll(targetEmails, subject, body);
    }
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
  const sched = garbage.scheduling || {};

  if (order.length === 0) return;

  const nextWed = getNextDayOfWeek(3); // 3 = Wednesday
  const y = nextWed.getFullYear();
  const m = String(nextWed.getMonth() + 1).padStart(2, '0');
  const d = String(nextWed.getDate()).padStart(2, '0');
  const dateKey = `${y}-${m}-${d}`;
  const dayOfMonth = nextWed.getDate();

  let person = order[nextIndex % order.length];
  if (sched.dateOverrides && sched.dateOverrides[dateKey]) {
    person = sched.dateOverrides[dateKey];
  } else if (Array.isArray(sched.recurringRules)) {
    const monthRule = sched.recurringRules.find(r => r.type === "day_of_month" && Number(r.day) === dayOfMonth);
    if (monthRule) person = monthRule.person;
  }

  const targetEmails = getEmailsForPerson(person, emails);
  if (targetEmails.length === 0) {
    Logger.log("No email found for Garbage Duty person: " + person);
    return;
  }

  const dateStr = nextWed.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });

  const subject = "[4042] [Garbage Day] Household Reminder: Your turn is this Wednesday (" + dateStr + ")";
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
  const sched = cleaning.scheduling || {};

  if (order.length === 0) return;

  const nextSun = getNextDayOfWeek(0); // 0 = Sunday
  const y = nextSun.getFullYear();
  const m = String(nextSun.getMonth() + 1).padStart(2, '0');
  const d = String(nextSun.getDate()).padStart(2, '0');
  const dateKey = `${y}-${m}-${d}`;
  const dayOfMonth = nextSun.getDate();

  let person = order[nextIndex % order.length];
  if (sched.dateOverrides && sched.dateOverrides[dateKey]) {
    person = sched.dateOverrides[dateKey];
  } else if (Array.isArray(sched.recurringRules)) {
    const monthRule = sched.recurringRules.find(r => r.type === "day_of_month" && Number(r.day) === dayOfMonth);
    if (monthRule) person = monthRule.person;
  }

  const targetEmails = getEmailsForPerson(person, emails);
  if (targetEmails.length === 0) {
    Logger.log("No email found for Cleaning Duty person: " + person);
    return;
  }

  const dateStr = nextSun.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });

  const subject = "[4042] [Cleaning Duty] Household Reminder: Your turn is this Sunday (" + dateStr + ")";
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
 * Unified Email Dispatcher for Instant Webhook Calls
 * Supports single email or comma-separated recipients, and custom subjects/bodies
 */
function handleSendEmail(section, person, email, customMessage, customSubject, customBody) {
  if (!email) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No recipient email provided" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const emailList = String(email).split(",").map(e => e.trim()).filter(Boolean);
  if (emailList.length === 0) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Empty email list" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const secLower = String(section || "").toLowerCase();
  let subject = customSubject || ("[4042] [Household Turn] Reminder for " + (person || "Roommate"));
  let body = customBody || `Hi ${person || "Roommate"},\n\nFriendly reminder: You have an upcoming turn for ${section || "household duty"}.\n\n${customMessage || "Please check the household web app to view details or mark your turn as done."}\n\nThanks!\nHousehold Organizer (Satnam)`;

  if (!customSubject) {
    if (secLower.includes("milk")) {
      subject = "[4042] [Milk Turn] Household Reminder: It is your turn to buy Milk!";
      body = customBody || `Hi ${person},\n\nFriendly reminder: You are up next on the Milk Turn!\nPlease pick up milk for the house when you can and mark it done on the web app.\n\nThanks!\nHousehold Organizer (Satnam)`;
    } else if (secLower.includes("garbage")) {
      subject = "[4042] [Garbage Day] Household Reminder: Your Garbage Duty is this week!";
      body = customBody || `Hi ${person},\n\nFriendly reminder: It's your turn for Garbage Day duty this week (every Wednesday)!\nPlease remember to pull the bins out.\n\nThanks!\nHousehold Organizer (Satnam)`;
    } else if (secLower.includes("cleaning")) {
      subject = "[4042] [Cleaning Duty] Household Reminder: Cleaning Duty this weekend!";
      body = customBody || `Hi ${person},\n\nFriendly reminder: You are scheduled for house cleaning duty this weekend!\n\nThanks!\nHousehold Organizer (Satnam)`;
    }
  }

  sendToAll(emailList, subject, body);

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Emails sent to: " + emailList.join(", ") }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Webhook handler for POST requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (_) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
    return handleSendEmail(payload.section, payload.person, payload.email, payload.customMessage, payload.subject, payload.body);
  } catch (err) {
    Logger.log("doPost Error: " + err);
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Webhook handler for GET requests (CORS-friendly fallback)
 */
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.email) {
      return handleSendEmail(
        e.parameter.section,
        e.parameter.person,
        e.parameter.email,
        e.parameter.customMessage,
        e.parameter.subject,
        e.parameter.body
      );
    }
    return ContentService.createTextOutput("Household Email Automation Webhook is ACTIVE! Send a GET or POST request with ?email=...&subject=...&body=... to trigger.");
  } catch (err) {
    Logger.log("doGet Error: " + err);
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
  
  if (person && person.includes("&")) {
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
      Logger.log("Sending email to: " + email + " | Subject: " + subject);
      GmailApp.sendEmail(email, subject, body, {
        name: "Household Organizer"
      });
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
