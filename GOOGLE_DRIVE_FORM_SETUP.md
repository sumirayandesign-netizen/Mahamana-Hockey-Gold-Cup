# Google Drive / Google Sheets enquiry form setup

**Status: REQUIRES AN ACTION BY THE OWNER OF `mmmbiharunit@gmail.com`.** This website is built and its forms are ready to send, but no form can automatically write into somebody's Google Drive without the account owner authenticating and granting access. Do not tell visitors the forms are connected before finishing the steps below.

## One-time 10-minute setup (under the correct Google account)

1. Sign in to **`mmmbiharunit@gmail.com`** in your browser.
2. Open [Google Apps Script](https://script.google.com/) and create a **New project** named `MHGC 2027 — Form Receiver`.
3. Open `Code.gs`, delete the starter example, and paste the entire contents of the file `google-apps-script/Code.gs` included in this website.
4. Save the script, select **`setup`** at the top, and click **Run**. Approve the Google permissions as the owner. This creates an organizer-owned Spreadsheet in **this Gmail account's Google Drive**, with three tabs: `Contact`, `Sponsorship` and `Team Interest`. Use **Execution log** to copy the Spreadsheet link and confirm it exists in Drive.
5. Click **Deploy → New deployment → Web app**. Set **Execute as: Me** (owner). Set access **Anyone** (public website submissions). Deploy and authorize. This publishes an endpoint; since it can receive public requests, periodically check spam/unusual entries and set organizational safeguards as needed.
6. Copy your real deployed **Web app URL**, which resembles `https://script.google.com/macros/s/AKfycb.../exec`.
7. Open `content/site-content.json` and set:

   ```json
   "integrations": {
     "googleAppsScriptUrl": "https://script.google.com/macros/s/REPLACE_WITH_YOUR_REAL_DEPLOYMENT_ID/exec",
     "status": "enabled_by_owner"
   }
   ```

   **Never use that illustrative placeholder as a real URL.**
8. Rebuild website from project root: `python scripts/build.py`.
9. Deploy the rebuilt website. Submit a **TEST** adult enquiry, verify the browser opens a success receipt, the row appears in the correct tab of the Google Spreadsheet, and an email notification reaches `mmmbiharunit@gmail.com` (possibly spam folder). Delete the test data afterward.
10. If you revise `Code.gs`, update the Apps Script deployment to a **new version** before testing again. Check that the online form still reaches the current endpoint.

## How submissions work

- Contact/sponsor/team-interest forms only collect **adult coordinator** details and free-text enquiry messages.
- Once enabled, the browser opens a new confirmation tab provided by Google Apps Script. **Only the success receipt in that tab confirms receipt.** The website does not falsely show success based on an unverified network call.
- The Apps Script writes each submission as a new row in the designated Sheet saved in the organizer's Google Drive and sends an optional email notification. No paid database subscription is needed for normal low-volume use; Google's quotas and policies still apply.
- The form includes required adult consent, a hidden anti-bot field, basic validation and a 45-second duplicate cooldown per email/form. This is basic protection, **not comprehensive abuse prevention**; heavy traffic requires CAPTCHA/rate-limit/security upgrades.
- Google Drive / Sheets permissions should be limited to staff who need the data. Decide retention/deletion period and obtain legal review of the website privacy notice before opening the form publicly.
- **No player rosters, Aadhaar, birth certificates, under-18 DOBs or sensitive health data** are requested. Tournament player registration needs a separately approved secure process after eligibility rules are confirmed.
- If endpoint is missing or invalid, the form blocks submission and shows the official mail address instead. Data are not silently discarded or misrepresented as sent.

## Troubleshooting

- **No Sheet:** Run `setup()` while logged in to the correct Gmail account.
- **Google sign-in requested of visitors:** Redo the deployment with the Web app access set to **Anyone** and **Execute as Me**, if this public submission model is appropriate for your organization.
- **No email alert:** Check Drive Sheet first, then Gmail spam and Apps Script execution logs. Mail notifications are subject to Google quotas.
- **Permission errors:** The owner must authorize Spreadsheet/Mail access; do not share Google account passwords.
- **Website submit button reports no endpoint:** Save a real deployed URL in `content/site-content.json`, rebuild, and reupload to hosting.
- **Offline local file:** The forms require internet and the deployed endpoint.
