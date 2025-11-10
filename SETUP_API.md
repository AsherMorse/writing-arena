# Claude API Setup Guide

## Getting Started with AI Feedback

The practice mode uses Claude Sonnet 4 for AI-powered writing feedback. Follow these steps to enable it:

### Step 1: Get Your API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-ant-`)

### Step 2: Configure Your Environment

1. Create a file called `.env.local` in the project root (same folder as `package.json`)
2. Add your API key:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

3. Save the file

### Step 3: Restart the Development Server

```bash
npm run dev
```

## How It Works

- **With API Key**: Real AI feedback from Claude Sonnet 4
- **Without API Key**: Mock feedback for testing (still functional!)

The app will automatically detect if you have an API key configured and use real AI feedback. If not, it falls back to mock feedback so you can still test the interface.

## API Costs

Claude API pricing (as of 2025):
- **Input**: ~$3 per million tokens
- **Output**: ~$15 per million tokens

Each writing analysis uses approximately:
- ~500 input tokens (the student's writing + prompt)
- ~800 output tokens (the detailed feedback)

**Estimated cost per student session**: $0.01-0.02

For a classroom of 30 students doing 3 sessions per week:
- Weekly cost: ~$2-3
- Monthly cost: ~$8-12

## Security Notes

⚠️ **Important**: Never commit your `.env.local` file to git! It's already in `.gitignore`.

## Testing

You can test the system without an API key - it will use intelligent mock feedback based on word count and trait focus.

## Need Help?

- [Anthropic Documentation](https://docs.anthropic.com/)
- [API Reference](https://docs.anthropic.com/en/api/getting-started)

