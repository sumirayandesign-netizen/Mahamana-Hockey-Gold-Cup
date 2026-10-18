# Mahamana Hockey Gold Cup 2027 — Website Project

Premium, responsive **35-page official website project**, incorporating the user's 2026 historical photos, video clips, 2026 sponsor/supporter logos, Instagram links, current contact details and 2027 event planning content. All core pages are ordinary HTML with CSS/JS, not a single-page mocked image.

## 1. Open the website

1. Extract the ZIP and preserve the complete `MHGC_2027_Website` folder structure.
2. For basic desktop inspection, open `index.html` in a browser. For more reliable media and local scripting behavior, use a local HTTP server from the project folder:

   ```bash
   python -m http.server 8000
   ```

   Then visit `http://localhost:8000`.
3. To publish, upload the **contents of the entire folder** to a static host such as Netlify, Cloudflare Pages, or a standard HTTPS web server. Keep all subfolders and files. Each section has a physical `index.html` path, so no client routing setup is required.

## 2. What's in this version

- Homepage with centred official 2027 logo, original navigation layout, dropdown menus, age/gender and date details, and 2026 media preview.
- 35 real navigable pages in `about/`, `2027/`, `2026/`, `sponsorship/`, `contact/`, and `privacy/`.
- **11 distinct uploaded 2026 photos** organized into **eight album categories** (some photos appear in more than one album for ease of discovery); full-screen image modal, album filters and load-more architecture for hundreds of future photos.
- **7 web-optimized MP4 videos** derived from the user's uploaded tournament footage. Some longer original videos are represented as 12-second web excerpts for performance. Original full-size files were not included because they are hundreds of megabytes; add them via a video platform or host them separately when required.
- **19 unique Instagram links** to the supplied reels/posts. On click, the website attempts to show Instagram's embedded player in a modal; an **Open on Instagram** link remains available because embedding may be blocked or require a login.
- **32 cropped logos** from the user's 2026 original `logo.pdf` sheet. They are labeled historical organizational/supporter identities, **not guaranteed commercial or 2027 sponsors**.
- All three phone numbers and the official email `mmmbiharunit@gmail.com` appear on the website and work as `tel:` / `mailto:` links.
- Real team-award results from the 2026 reference materials and separate 2027 pages. No invented confirmed 2027 roster or committee.
- Google Apps Script receiving service source code and step-by-step deployment guide for organizer-owned Drive/Sheets.

## 3. Forms and the Google Drive requirement (mandatory owner action)

Forms are coded for adult contact, sponsor and team-interest enquiries, but **they cannot yet send data to Google Drive until the owner authorizes and deploys the Apps Script**. For legitimate security/privacy reasons, we cannot authenticate as or operate `mmmbiharunit@gmail.com` without the owner's approval.

**Read `GOOGLE_DRIVE_FORM_SETUP.md` and follow the exact steps.** It creates a Google Spreadsheet in the Gmail owner's Drive, with three tabs: `Contact`, `Sponsorship`, and `Team Interest`. Each successful submission produces a Google-hosted receipt and triggers a notification email. The website must be rebuilt after inserting the real deployed web-app URL.

While no endpoint is configured, forms explicitly show **NOT connected** and direct the user to email or phone. They **do not** fabricate a successful submission. Never share the account password. Verify a test submission in Sheets before making the site public.

## 4. Editing photos, video, contacts, sponsor list, Instagram

All structured content is in `content/site-content.json`. Modify the data, then run:

```bash
python scripts/build.py
```

- `albums`: `photos` hold full-resolution web paths and thumbnail paths. Place future photos in `assets/photos/`, then add them to one or more albums; the existing album filter and photo viewer support large collections.
- `reels`: `src` for a hosted MP4 and `poster`; or `instagram` for an official Instagram URL. Original user-supplied social links are already included; additional URLs can be added later.
- `pastSponsors`: logos from the historical 2026 PDF are listed here. Do not claim they signed 2027 sponsorship contracts without confirmation.
- `contact`: email, three numbers and historical secretariat reference. Current address should be confirmed before public use.
- `committee2027` / `confirmed2027Teams`: intentionally remain empty until organizers supply confirmed members/teams.
- `integrations.googleAppsScriptUrl`: **leave empty until owner deploys a genuine endpoint**.

The supplied `scripts/import_photos.py` can help in bulk imports. Remember to rebuild after editing data.

## 5. Before publishing

Read `PUBLISH_CHECKLIST.md`. Confirm 2027 committee/teams, final sponsorship packages and awards, address, minors' photo publication permissions, Google form receipt and organizer-approved privacy policy.

**Do not claim online registration is officially open merely because adults can submit a team-interest enquiry.** The full Under-16 registration/eligibility workflow is separate.

## 6. Folder outline

```text
MHGC_2027_Website/
  index.html                    Homepage
  about/, 2027/, 2026/         Main page routes
  sponsorship/, contact/       Sponsor and contact pages
  assets/style.css             Design system
  assets/site.js               Galleries, reels, menus, form handling
  assets/brand/                Original organizer/tournament/mascot assets
  assets/photos/               Real photos and optimized thumbnails
  assets/media/                Video files and preview poster frames
  assets/sponsors/             All cropped logos from supplied PDF
  assets/docs/                 2026 historical official catalogue
  content/site-content.json    Editable site data
  content/data.js              Generated front-end copy of editable data
  scripts/build.py             Rebuild page HTML and content/data.js
  google-apps-script/Code.gs   Organizer-owned Google Sheets receiving service
  GOOGLE_DRIVE_FORM_SETUP.md   Configuration steps
  PUBLISH_CHECKLIST.md        Pre-launch review tasks
```

Website is ready for the owner's review and deployment; its remote storage and live domain are **not** provisioned automatically.
