# Environment Setup Guide

## Local Development

1. Get a new Gemini API key from: https://makersuite.google.com/app/apikey
2. Copy `environment.ts` content and add your new API key locally
3. **Never commit API keys to Git!**

## Production (GitHub Actions)

The API key is stored securely in GitHub Secrets and injected during build.

### Add GitHub Secret:

1. Go to: https://github.com/DeepaChauhan-Work/QuizAI/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GEMINI_API_KEY`
4. Value: Your new Gemini API key
5. Click "Add secret"

## Firebase Configuration

Firebase API keys are safe to commit because they're protected by Firebase Security Rules.
Only the Gemini API key needs to be kept secret.
