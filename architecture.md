# my unistream blog (UnistreamApp)

A full-featured, serverless social ecosystem and youth entrepreneurship platform built for the **Unistream** community. The application operates entirely on a **Backend-as-a-Service (BaaS)** architecture using Google Firebase (Cloud Firestore & Authentication), eliminating the need for a dedicated backend server while providing real-time data sync, image processing, interactive community polls, and personalized startup profiles.

---

## 1. Architectural Overview

```
Client (Browser: HTML5 / CSS3 / Vanilla ES6+ Modules)
   │
   ├── Google Authentication (Firebase Auth via Google Popup)
   │
   ├── Cloud Firestore (NoSQL Real-Time Database)
   │      ├── /posts      (Public feed, sequential #IDs, likes, views, comments)
   │      ├── /users      (Profile metadata: 1:1 avatar, 3:1 banner, center, startup, year)
   │      ├── /surveys    (Slide-based polls, responses, vote distribution)
   │      └── /metadata   (Atomic counters & shared registries)
   │
   └── Local Storage (Client-side cache engine eliminating layout shift & FOUC)
```

### Core Design Principles
1. **Serverless & Self-Contained:** Zero Node.js or Python backend runtime. All data validation and access control are delegated to Firebase Security Rules.
2. **Instant Rendering (Anti-FOUC):** User profile data (avatar, banner, display name, handle) is cached in `localStorage`. Page transitions load instantaneously without flickering or showing default placeholder images while asynchronous network queries resolve.
3. **Optimized Client-Side Storage:** Images (avatars, banners, post attachments, startup logos) are processed, cropped, and compressed via HTML5 Canvas into lightweight Base64 strings, keeping Firestore document sizes minimal without requiring external storage buckets.

---

## 2. Project Directory Structure

```text
UnistreamApp/
├── analysis/
│   ├── dashboard.html      # Analytics command center for community surveys & polls
│   ├── new-survey.html     # Slide-by-slide survey constructor (Typeform/Stories style)
│   └── take-survey.html    # Interactive survey runner & voting player
├── icons/                  # Application graphic assets & action iconography
├── add-post.html           # Dedicated post composer with image compression
├── app.js                  # Main controller: real-time feed, tabs, interactions & cache
├── firebase.js             # Centralized Firebase SDK initialization and module gateway
├── index.html              # Primary application hub & navigation framework
├── login.html              # Google OAuth sign-in portal
├── profile.html            # Public creator profile, startup showcase & stats
├── settings.html           # Profile customization, 1:1 crop, year & center configuration
└── style.css               # Global responsive stylesheet & unified design system
```

---

## 3. Comprehensive File-by-File Breakdown

### `index.html` (Application Hub)
The landing page and primary interface of the social network.
* **Top Header (`.app-header`):** Finished in `#030040` deep navy with the user avatar on the left, centered branding (`logo.png` + `name.png`), and a back-link system.
* **Top Navigation Bar:** Three-tab switch dividing the feed into:
  1. **All (`#tabFeedGlobal`):** Mixed real-time public stream of all community posts.
  2. **Recommended (`#tabFeedRecommended` [beta]):** Filtered feed placeholder for followed creators and tags.
  3. **Polls (`#tabFeedPolls` [beta]):** Interactive community surveys listing active polls with completion states.
* **Bottom Navigation Bar (`.bottom-nav`):** Quick-action bar providing access to user profile, post creation (`+`), and an expandable bottom-sheet menu.
* **Bottom Sheet Menu (`.bottom-sheet`):** Slide-up drawer linking to Surveys Dashboard, Profile Settings, App Info, and Account Logout.
* **Guest Authentication Modal (`#authDialogBackdrop`):** Intercepts unauthorized attempts to like posts or access restricted features, providing an instant redirection prompt to `login.html`.

---

### `app.js` (Main Feed Controller)
The core JavaScript logic powering `index.html`.
* **Real-time Firestore Subscriptions:** Listens to the `posts` collection ordered chronologically by `createdAt desc`.
* **Anti-Flicker Initialization:** Reads `user_cached_profile` from `localStorage` on boot to set header avatars before network handshakes complete.
* **Dynamic Time Formatting (`formatTimeAgo`):** Converts server timestamps into intuitive relative indicators (`## seconds ago`, `## minutes ago`, `## hours ago`, `## days ago`, or formatted calendar dates).
* **Interactive Post Actions:**
  * **Likes:** Real-time toggling via Firestore `arrayUnion` / `arrayRemove` using `currentUser.uid`. Swaps icons between `heart-on.png` and `heart-off.png`.
  * **Views Counter:** Session-tracked (`sessionStorage`) automatic incrementing via Firestore `increment(1)` ensuring views from guests and registered users are accurately counted without infinite query loops.
  * **Share Action:** Copies permanent deep-link anchors to the user's system clipboard (`#postId`).
* **Header & Nav Routing:** Binds top avatar and bottom navigation buttons to authentication verification routines (`requireAuth`).

---

### `firebase.js` (Firebase Module Gateway)
The infrastructure backbone of the project.
* Initializes the Firebase client app instance using ES Module CDN imports (`https://www.gstatic.com/firebasejs/10.8.0/`).
* Configures and exports Firebase Authentication (`getAuth`, `GoogleAuthProvider`, `signInWithPopup`, `signOut`, `updateProfile`).
* Configures and exports Cloud Firestore (`getFirestore`, `doc`, `collection`, `addDoc`, `setDoc`, `getDoc`, `updateDoc`, `deleteDoc`, `increment`, `arrayUnion`, `arrayRemove`, `runTransaction`, `query`, `orderBy`, `where`, `onSnapshot`).

---

### `style.css` (Design System & Stylesheet)
Unified styling file maintaining visual consistency across all viewports.
* **Color Palette:** Primary brand color `#030040` (deep blue/navy), `#ffffff` content cards, neutral grey background tones (`#f5f6fb`), and `#248a3d` success accents.
* **Mobile-First Layout:** Fixed headers, sticky navigation bars, native scrolling feed containers, and responsive desktop wrappers.
* **Media Rendering:** Ensures post attachments never stretch distortively using `max-width: 100%`, `height: auto`, and `object-fit: contain`.
* **Component Library:** Styles for bottom sheets, modals, IDE tabs, poll progress tracks, avatar camera badges, and startup pill tags.

---

### `login.html` (Authentication Gateway)
A distraction-free, branded sign-in portal.
* Features the prominent `icons/logo-bold.png` logo and taglines.
* Single-click Google Sign-In using `signInWithPopup(auth, provider)` with a custom Google button (`icons/google.png`).
* Redirects authenticated users directly back to the main feed (`index.html`).
* Includes a guest return link (`Back to feed`).

---

### `add-post.html` (Post Composer)
A dedicated interface for authoring community content.
* **Author Preview:** Automatically fetches the author's cached name and avatar.
* **Image Compression Engine:** Employs an invisible HTML5 canvas downscaler that processes local device images to a maximum dimension of 900px at 78% JPEG quality, converting them to Base64 data strings.
* **Sequential Numbering (#ID):** Uses Firestore `runTransaction` on `metadata/posts_counter` to assign deterministic, human-readable post numbers (`#1`, `#2`, `#3`, etc.).
* **Adaptive Floating Button:** Fixed action button with `icons/post.png` remaining accessible above soft-keyboards on mobile devices.
* **Survey Quick-Link:** Header shortcut allowing users to jump directly to the survey creator.

---

### `profile.html` (Creator Showcase & Personal Portfolio)
The personalized portfolio page for Unistream participants.
* **Cinematic Cover & Avatar:** Displays the user's custom 3:1 landscape banner and overlapping circular profile picture with CORS-safe `referrerpolicy="no-referrer"`.
* **Entrepreneurial Meta Data:**
  * **Verification Badge:** Blue checkmark icon (`✓`) rendered if `isVerified: true` is approved by an administrator in the database.
  * **Cohort Year Tag:** Identifies the user's Unistream training stage (`🎓 Year Alef`, `Year Bet`, `Year Gimel`, or `Other`).
  * **Center / Hub Tag:** Displays the user's local innovation center (e.g., `📍 Tech Innovation Hub`).
  * **Working On Status Banner:** Prominent status badge featuring the startup's custom logo and the text: `Working on [Startup Name] at [Center Name]`.
* **Engagement Statistics Card:** Tracks aggregated metric counters (Total Views, Total Posts, Viewed).
* **Dual-Tab Workspace:** Toggle switch between **Posts** and **Chats**.
* **Post Management:** Three-dot dropdown menu (`icons/post-menu.png`) on authored posts allowing real-time deletion (`deleteDoc`).

---

### `settings.html` (Profile Customization Center)
The control panel for configuring user identities.
* **Live Preview Card:** Dynamic card reflecting display name, nickname (`@username`), banner, and avatar updates in real time prior to saving.
* **1:1 Center-Cropped Avatar Processor:** Automatically detects dimensions of any uploaded file, crops the exact center square (1:1), scales to 400x400px, and encodes it into Base64 text.
* **3:1 Landscape Banner Processor:** Crops and scales uploaded banner images into a 900x300 widescreen format.
* **Unistream Cohort Selector:** Dropdown to select cohort training years (`Alef`, `Bet`, `Gimel`, `Other`).
* **Shared Center Registry:** Input field equipped with an HTML5 `<datalist>` supporting search across known hubs as well as freeform entry of custom centers.
* **Startup Identity:** Input fields for the venture's name and a dedicated file picker for the startup's square logo.
* **Verification Request Engine:** Submits an `isVerified` review request to Firestore (`verificationRequested: true`).
* **Non-Destructive In-Page Confirmation:** A centered modal card featuring `icons/end.png` and a dismissive "OK" button confirming that Firestore records and `localStorage` caches have synced without redirecting away.

---

### `analysis/dashboard.html` (Survey Analytics Center)
A comprehensive analytics dashboard for community feedback and research polls.
* **Left Sidebar Metrics:** Aggregated metrics displaying total survey views, total submissions, overall votes, and completion rate percentages.
* **7-Day Engagement Chart:** Pure CSS bar-chart visualizer depicting engagement patterns over a weekly cycle.
* **IDE-Style Code Tabs:** Tab bar designed after development environments (`all_surveys.view`, `*.survey`), letting authors navigate seamlessly between surveys.
* **Detailed Breakdown View:** Displays option performance with percentage progress bars and highlights the current leading response (`★ Leading`).

---

### `analysis/new-survey.html` (Slide-Based Survey Constructor)
A multi-slide survey authoring tool modeled after modern interactive story formats.
* **Slide Navigation Rail:** Left-hand slide selector enabling authors to toggle between intro screens and individual question cards.
* **Optional Welcome Slide:** Configurable title, descriptive text, and cover image.
* **Four Diverse Question Types:**
  1. **Single Choice:** Radio-button style single-selection options.
  2. **Checklist (Multiple):** Multi-select options.
  3. **Text Answer:** Open-ended user text feedback.
  4. **Scale (1 to 10):** Numeric satisfaction or evaluation slider.
* **Question Attributes:** Ability to set mandatory constraints (`Required: Yes/No`), add optional guidance text, attach contextual images, and reorder options.

---

### `analysis/take-survey.html` (Interactive Survey Runner)
The survey completion engine for respondents.
* **Step-by-Step Flow:** Clean card player showing one question per slide with a dynamic top progress bar (`.runner-progress-fill`).
* **Universal Participation:** **Authors are explicitly permitted to vote on and test their own questions** without permission locks or administrative blocks.
* **Vote Submission Engine:** Atomically updates Firestore survey documents via `increment(1)` on vote mappings, updates `totalVotes`, and marks the respondent in `voters.{uid}` to activate the green `✓ Completed` badge in the main feed.
* **Completion Screen:** Clean celebration screen providing direct navigation back to the feed or to survey analytics.

---

## 4. Firestore Database Architecture

### `posts` Collection
```json
{
  "postNumber": 42,
  "text": "Excited to pitch our new AI sustainability venture today!",
  "imageUrl": "data:image/jpeg;base64,...", // Optional compressed attachment
  "authorId": "firebaseAuthUid123",
  "authorName": "Noa Cohen",
  "authorAvatar": "data:image/jpeg;base64,...",
  "createdAt": "ServerTimestamp",
  "likes": ["uid_1", "uid_2"],
  "views": 158,
  "commentsCount": 0
}
```

### `users` Collection
```json
{
  "displayName": "Noa Cohen",
  "username": "noac",
  "avatarUrl": "data:image/jpeg;base64,...", // 1:1 Square (400x400)
  "bannerUrl": "data:image/jpeg;base64,...", // 3:1 Widescreen (900x300)
  "center": "Tel Aviv Innovation Center",
  "year": "Bet",
  "startup": {
    "name": "EcoPack",
    "icon": "data:image/png;base64,..."
  },
  "isVerified": true,
  "verificationRequested": false,
  "updatedAt": "ServerTimestamp"
}
```

### `surveys` Collection
```json
{
  "question": "What market sector does your startup address?",
  "hasWelcome": true,
  "welcome": {
    "title": "Unistream Cohort Market Research",
    "description": "Please take 2 minutes to fill out our poll.",
    "image": "data:image/jpeg;base64,..."
  },
  "questions": [
    {
      "id": "q_1",
      "title": "Select your industry domain:",
      "description": "Choose the most relevant option",
      "type": "choice",
      "options": ["FinTech", "HealthTech", "CleanTech", "EdTech"],
      "required": true,
      "image": null
    }
  ],
  "totalQuestions": 1,
  "votes": {
    "0": 14,
    "1": 8,
    "2": 22,
    "3": 5
  },
  "voters": {
    "userUidABC": { "0": 2 }
  },
  "totalVotes": 49,
  "views": 84,
  "authorId": "firebaseAuthUid123",
  "authorName": "Noa Cohen",
  "authorAvatar": "data:image/jpeg;base64,...",
  "createdAt": "ServerTimestamp"
}
```

### `metadata` Collection
* **`posts_counter` Document:** Holds `{ "count": 42 }` updated atomically via `runTransaction` during post publishing to maintain uninterrupted sequential numbering.

---

## 5. Security Rules Specification

To secure the database without a backend, deploy the following rules in **Firebase Console ➔ Firestore Database ➔ Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public feeds: Anyone can read, logged-in users can publish and like
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if true; // Permits view counting for guests & liking for authenticated users
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }

    // Counters and metadata
    match /metadata/{docId} {
      allow read, write: if request.auth != null;
    }

    // User profiles: Publicly readable, modifiable only by the account owner
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Surveys and polls: Anyone can view, users can vote and create, author can delete
    match /surveys/{surveyId} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

---

## 6. Local Setup and Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/UnistreamApp.git
   cd UnistreamApp
   ```

2. **Configure Firebase Credentials:**
   Open `firebase.js` and populate `firebaseConfig` with your project keys:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **Launch a Local Development Server:**
   Because the project relies on native ES Modules (`import`/`export`), open the directory via a local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node npx
   npx serve .
   ```
   Navigate to `http://localhost:8000` in any modern web browser.