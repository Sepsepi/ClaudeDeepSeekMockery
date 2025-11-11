# ClaudeDeepSeekMockery

A Claude.ai-inspired chat interface powered by DeepSeek AI with image recognition, authentication, and conversation persistence.

## Features

- **AI-Powered Chat**: Real-time streaming responses using DeepSeek API
- **Image Recognition**: Upload and analyze images with DeepSeek vision
- **User Authentication**: Email/password and Google OAuth support
- **Conversation Management**: Save and load chat history
- **Account Settings**: Theme selection, notifications, profile management
- **Modern UI**: Clean design with light green accent theme
- **Serverless Architecture**: Built on Next.js 14 with edge functions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email + OAuth)
- **AI**: DeepSeek API (OpenAI-compatible)
- **Deployment**: Vercel

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- DeepSeek API key
- Google OAuth credentials (optional, for Google sign-in)

### 1. Clone and Install

```bash
git clone https://github.com/Sepsepi/ClaudeDeepSeekMockery.git
cd ClaudeDeepSeekMockery
npm install
```

### 2. Set Up Supabase Database

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema-safe.sql`
4. Paste and run the SQL to create tables, storage bucket, and policies

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 4. Set Up Google OAuth (Optional)

#### A. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Choose **Web application**
7. Add authorized redirect URIs:
   - For local: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
8. Copy **Client ID** and **Client Secret**

#### B. Add to Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and enable it
3. Paste your Google Client ID and Secret
4. Copy the Supabase callback URL shown
5. Add this callback URL to Google Console:
   - Format: `https://[your-project-ref].supabase.co/auth/v1/callback`

#### C. Update Environment Variables

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DEEPSEEK_API_KEY`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (if using Google OAuth)
   - `GOOGLE_CLIENT_SECRET` (if using Google OAuth)
5. Click **Deploy**

### 3. Update OAuth Redirect URLs

After deployment, add your Vercel URL to:
- **Supabase**: Authentication → URL Configuration → Site URL
- **Google Console**: Add `https://your-app.vercel.app/auth/callback`

---

## Project Structure

```
ClaudeDeepSeekMockery/
├── app/
│   ├── api/
│   │   └── chat/              # DeepSeek API route with vision support
│   ├── auth/
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── callback/          # OAuth callback
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main chat page
│   └── globals.css            # Global styles
├── components/
│   ├── Auth/
│   │   └── AuthForm.tsx       # Login/signup form
│   ├── Chat/
│   │   ├── Message.tsx        # Message component with image display
│   │   ├── MessageList.tsx    # Messages container with suggestions
│   │   └── MessageInput.tsx   # Input with image upload
│   ├── Layout/
│   │   └── Sidebar.tsx        # Conversation history
│   └── AccountSettings.tsx    # Settings modal
├── lib/
│   ├── supabase.ts            # Supabase client
│   └── deepseek.ts            # DeepSeek API client (vision support)
└── supabase-schema-safe.sql   # Complete database schema
```

---

## Database Schema

### Tables

**conversations**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `title` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**messages**
- `id` (UUID, primary key)
- `conversation_id` (UUID, foreign key to conversations)
- `role` (text: 'user' or 'assistant')
- `content` (text)
- `image_url` (text, optional)
- `created_at` (timestamp)

**user_preferences**
- `user_id` (UUID, primary key, foreign key to auth.users)
- `theme` (text: 'light', 'dark', or 'auto')
- `notifications_enabled` (boolean)
- `language` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Storage**
- `chat-images` bucket for uploaded images

### Security

- Row Level Security (RLS) enabled
- Users can only access their own conversations and messages
- Automatic timestamp updates via triggers

---

## Customization

### Change Theme Colors

Edit `app/globals.css`:

```css
/* Main accent color (currently light green) */
--accent-main-100: 140 54.2% 51.2%;  /* Change hue: 140 */
```

### Change AI Model

Edit `lib/deepseek.ts`:

```typescript
model: 'deepseek-chat',  // or 'deepseek-coder'
```

---

## Troubleshooting

### Google OAuth Not Working

1. Check redirect URLs match exactly (with/without trailing slash)
2. Verify Google OAuth consent screen is published
3. Ensure domain is added to authorized domains in Google Console
4. Check Supabase logs for detailed error messages

### DeepSeek API Errors

1. Verify API key is correct
2. Check you have credits in your DeepSeek account
3. Review rate limits: https://platform.deepseek.com/docs

### Database Connection Issues

1. Verify Supabase URL and keys are correct
2. Check RLS policies are set up (run supabase-schema.sql)
3. Ensure user is authenticated before accessing data

---

## API Costs

- **DeepSeek**: ~$0.14 per 1M input tokens, ~$0.28 per 1M output tokens
- **Supabase**: Free tier includes 500MB database, 50MB file storage
- **Vercel**: Free tier includes 100GB bandwidth

---

## Support

For issues or questions:
1. Check the [DeepSeek API docs](https://platform.deepseek.com/docs)
2. Review [Supabase Auth docs](https://supabase.com/docs/guides/auth)
3. See [Next.js 14 documentation](https://nextjs.org/docs)

---

## License

MIT
