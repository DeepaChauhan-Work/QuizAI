# Deployment Guide: GitHub to Firebase Hosting

Follow these steps to deploy your QuizAI application to Firebase Hosting with automated CI/CD from GitHub.

## Step 1: Initialize Git Repository (if not already done)

```bash
cd c:\Deepa\MakanKeMalik\PrimeRealty
git init
git add .
git commit -m "Initial commit - QuizAI project"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon → **New repository**
3. Repository name: `QuizAI` or `PrimeRealty`
4. Description: "AI-Powered Quiz Platform with Angular and Firebase"
5. Make it **Public** or **Private** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

## Step 3: Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values.

## Step 4: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 5: Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate with your Google account.

## Step 6: Create/Select Firebase Project

Option A - Create New Project:
```bash
firebase projects:create
```

Option B - Use Existing Project:
```bash
firebase use --add
```

Select your project and give it an alias (e.g., "default").

## Step 7: Initialize Firebase Hosting

```bash
firebase init hosting
```

When prompted:
- Select your Firebase project
- What do you want to use as your public directory? **dist/prime-realty/browser**
- Configure as a single-page app (rewrite all urls to /index.html)? **Yes**
- Set up automatic builds and deploys with GitHub? **No** (we'll do this manually with GitHub Actions)

## Step 8: Test Local Build

```bash
npm run build
firebase serve
```

Visit `http://localhost:5000` to test your app locally.

## Step 9: Get Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the JSON file (keep it secure, never commit to Git!)
7. Copy the entire JSON content

## Step 10: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

**Secret 1: FIREBASE_SERVICE_ACCOUNT**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: Paste the entire JSON content from Step 9

**Secret 2: FIREBASE_PROJECT_ID**
- Name: `FIREBASE_PROJECT_ID`
- Value: Your Firebase project ID (e.g., `quizai-12345`)

## Step 11: Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Step 12: Push to GitHub to Trigger Deployment

```bash
git add .
git commit -m "Setup Firebase hosting and GitHub Actions"
git push origin main
```

## Step 13: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see your workflow running
4. Wait for it to complete (usually 2-5 minutes)

## Step 14: Access Your Live App

Once deployed, your app will be available at:
```
https://YOUR_PROJECT_ID.web.app
```

or

```
https://YOUR_PROJECT_ID.firebaseapp.com
```

## Troubleshooting

### Build Fails on GitHub Actions

Check the build output in the Actions tab. Common issues:
- Missing environment variables
- TypeScript errors
- Build configuration issues

### Firebase Service Account Error

Make sure:
- The JSON is properly formatted (no extra quotes)
- You copied the entire JSON including `{}` brackets
- The secret name is exactly `FIREBASE_SERVICE_ACCOUNT`

### Firestore Permission Denied

Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### App Shows 404 After Refresh

Make sure `firebase.json` has the rewrite rule:
```json
"rewrites": [
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

## Future Deployments

Now that everything is set up, any push to the `main` branch will automatically:
1. Build your Angular app
2. Deploy to Firebase Hosting
3. Make it live!

Just commit and push:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

## Manual Deployment (Optional)

If you want to deploy manually instead of using GitHub Actions:

```bash
npm run build
firebase deploy --only hosting
```

## Custom Domain (Optional)

To add a custom domain:
1. Go to Firebase Console → Hosting
2. Click **Add custom domain**
3. Follow the instructions to verify and connect your domain

---

**Need Help?**
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- Contact: deepa.chauhan222

**Happy Deploying! 🚀**
