# Campus Lost & Found (OAU Edition)

An AI-powered Lost & Found web platform for Obafemi Awolowo University (OAU) students, built with React, Vite, Tailwind CSS v4, Express, and Firebase Cloud Firestore.

---

## Features

- **Strict OAU Verification**: Registration requires valid `@student.oauife.edu.ng` email addresses and `XXX/0000/000` matriculation numbers.
- **Jaro-Winkler AI Similarity Engine**: Automatic match scoring ($\ge 60\%$) between lost and found items.
- **In-App Messaging & Notifications**: Safe peer-to-peer chat for item recovery.
- **Admin Moderation**: Superadmin user management and item flag reviews.
- **Firebase Firestore Database**: Cloud database persistence for multi-device sync and Vercel serverless compatibility.

---

## Quick Start (Local Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```

3. **Start API Backend**:
   ```bash
   npm run server
   ```

---

## Deploying to Vercel with Firebase

1. **Create a Free Firebase Project**:
   * Go to [console.firebase.google.com](https://console.firebase.google.com/) and create a project.
   * Navigate to **Build -> Firestore Database** and click **Create Database**.
   * Click **Add App** ($\langle/\rangle$ Web icon) to get your project configuration keys.

2. **Connect to Vercel**:
   * Push your project to GitHub.
   * Import the repository in [Vercel](https://vercel.com).
   * In **Project Settings -> Environment Variables**, add:
     * `FIREBASE_API_KEY`
     * `FIREBASE_AUTH_DOMAIN`
     * `FIREBASE_PROJECT_ID`
     * `FIREBASE_STORAGE_BUCKET`
     * `FIREBASE_MESSAGING_SENDER_ID`
     * `FIREBASE_APP_ID`

3. **Deploy!** Your site will be live with full real-time database persistence.