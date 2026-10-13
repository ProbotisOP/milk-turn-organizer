# Milk Turn Organizer — setup guide

This is a phone-friendly website for the household members Raghav, Ritish, Navneet, Akash, Satnam, Vaibhav, Sourab, and Abhi. It displays no duty dates. The turn is tracked as a sequence. Everyone can open the same website on Android or iPhone.

## What you need
- A Google account
- A free Firebase project
- A GitHub account for free static hosting

## 1. Create the shared database
1. Open https://console.firebase.google.com/ and create a project (for example `milk-turn-household`).
2. In **Build → Realtime Database**, create a database. Choose a nearby region and start in locked mode.
3. In **Build → Authentication → Sign-in method**, enable **Anonymous** sign-in.
4. In **Project settings → General**, register a Web app and copy the Firebase configuration.
5. Open `index.html` and replace the five `PASTE_...` values in `firebaseConfig` with the values from Firebase. Use the exact `databaseURL` Firebase shows you; database URLs can vary by region.

## 2. Database rules
For the prototype to work, users must be signed in anonymously. In Realtime Database → Rules, use this basic rule:

```json
{
  "rules": {
    "households": {
      "shared-household": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

**Security limitation:** anonymous authentication prevents unauthenticated database access, but anyone who can open the public website can sign in anonymously and can potentially modify shared data or impersonate a name. This is acceptable only for a low-stakes household prototype. For stronger protection, add real sign-in or a server-side API that validates member identity and swap approvals. Do not put passwords, financial information, or other sensitive data in this app.

## 3. Publish on GitHub Pages
1. Create a GitHub repository, e.g. `milk-turn-organizer`.
2. Upload `index.html` to the repository root. `SETUP.md` is optional to publish.
3. In repository **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, and save.
4. Wait for GitHub Pages to publish the website. Open the URL shown in Pages settings on a phone.
5. Share that same URL with all household members.

## 4. Use on phones
- **iPhone:** open the link in Safari → Share → Add to Home Screen.
- **Android:** open the link in Chrome → menu → Add to Home screen (or Install app if offered).

## Behavior and limitations
- Initial sequence: Raghav → Ritish → Navneet → Akash → Satnam → Vaibhav → Sourab → Abhi.
- The person shown as next can mark the turn completed or pass it. Completing advances the rotation.
- A swap request is pending until the selected recipient opens the app using their name and accepts or declines. Acceptance swaps the two names' positions in the rotation.
- The activity history is shared and retained in the database.
- No dates are displayed. There is no automated notification system in this version.
- This is a starter implementation, not a managed or audited production service. Review Firebase usage and security before relying on it.
