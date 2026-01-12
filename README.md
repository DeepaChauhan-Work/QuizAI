# QuizAI - AI-Powered Quiz Platform

An intelligent quiz generation and management platform built with Angular and Firebase, featuring AI-powered quiz creation using Google's Gemini API.

## Features

- 🤖 **AI-Powered Quiz Generation**: Create quizzes from text, documents (PDF, Word, Excel), or topics using Google Gemini AI
- 👥 **Role-Based Access**: Separate interfaces for administrators and students
- 📊 **Analytics Dashboard**: Track quiz performance and student participation
- 🎯 **Real-Time Results**: Instant feedback and scoring
- 🔐 **Secure Authentication**: Username-based login with Firebase Authentication
- 📱 **Responsive Design**: Beautiful UI with Tailwind CSS

## Tech Stack

- **Frontend**: Angular 17+ (Standalone Components)
- **Backend**: Firebase (Firestore, Authentication, Hosting)
- **AI**: Google Generative AI (Gemini)
- **Styling**: Tailwind CSS
- **Document Processing**: mammoth, pdfjs-dist, xlsx

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Google AI API key (Gemini)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/PrimeRealty.git
cd PrimeRealty
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication (Anonymous)
   - Copy your Firebase configuration to `src/environments/environment.ts`

4. Configure Google AI:
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to your environment file

5. Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deployment

This project uses GitHub Actions for automated deployment to Firebase Hosting.

### Setup Automated Deployment

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

4. Get your Firebase service account:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Project Settings → Service Accounts
   - Generate new private key
   - Save the JSON file securely

5. Add secrets to GitHub:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add `FIREBASE_SERVICE_ACCOUNT` (paste the entire JSON content)
   - Add `FIREBASE_PROJECT_ID` (your Firebase project ID)

6. Push to main branch:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

The GitHub Action will automatically build and deploy your app!

## Project Structure

```
src/
├── app/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # Business logic services
│   ├── models/           # TypeScript interfaces
│   └── guards/           # Route guards
├── environments/         # Environment configurations
└── assets/              # Static assets
```

## Usage

### Admin Features
- Create quizzes manually or with AI assistance
- Upload documents to generate quizzes
- View analytics and student performance
- Manage quiz content

### Student Features
- Browse available quizzes
- Take quizzes and get instant results
- View quiz history and scores
- Track learning progress

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Developer

**Developed with ❤️ by Deepa Chauhan**

- GitHub: [@deepa.chauhan222](https://github.com/deepa.chauhan222)
- Facebook: [deepa.chauhan222](https://www.facebook.com/deepa.chauhan222)
- Twitter: [@deepa.chauhan222](https://twitter.com/deepa.chauhan222)
- Instagram: [@deepa.chauhan222](https://www.instagram.com/deepa.chauhan222)

## Acknowledgments

- Google Generative AI for quiz generation
- Firebase for backend services
- Angular team for the amazing framework
- Tailwind CSS for beautiful styling
