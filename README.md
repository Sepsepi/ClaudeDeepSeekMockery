# AI Chat Application

> A fast, clean, mobile-first AI chat application with a focus on conversation quality and user experience.

**Built with:** Next.js 14, Supabase, and DeepSeek AI

---

## 🎯 Philosophy

This is a **simple product done extremely well** - a conversational AI interface that prioritizes:
- **Feel & Tone** over feature bloat
- **Performance** over complexity
- **Clean UX** over excessive onboarding
- **Human conversation** over robotic interactions

Inspired by Claude.ai's design philosophy, delivering what users actually need.

---

## ✨ Features

### Core Chat Experience
- **Real-time Streaming** - Smooth AI responses with no waiting
- **Image Upload** - Attach and discuss images in conversations
- **Conversation History** - Persistent chat threads with search
- **Multiple Chat Modes** - Assistant, Creative, Technical, Casual styles
- **Anonymous Mode** - Private chat without history tracking

### User Management
- **Google OAuth + Email** - Flexible, secure authentication
- **Theme System** - Light/dark mode with persistence
- **Activity Stats** - Track conversations and messages
- **Subscription Tiers** - Ready for Free/Pro/Enterprise plans
- **Profile Settings** - Customize name, preferences, notifications

### Technical Excellence
- **Edge Runtime** - Fast API responses
- **Mobile-First** - Fully responsive on all devices
- **Type-Safe** - Complete TypeScript coverage
- **Row Level Security** - Secure database access
- **Clean Architecture** - Modular, extensible code

---

## 🛠 Tech Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
**Backend:** Supabase (PostgreSQL + Auth + Storage)
**AI:** DeepSeek API (OpenAI-compatible, swappable)
**Deployment:** Vercel Edge Functions
**Auth:** @supabase/ssr with OAuth2 PKCE

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
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL to create tables, policies, and triggers

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
- `display_name` (text, optional)
- `theme` (text: 'light' or 'dark')
- `notifications_enabled` (boolean)
- `anonymous_mode` (boolean)
- `chat_mode` (text: 'assistant', 'creative', 'technical', 'casual')
- `subscription_tier` (text: 'free', 'pro', 'enterprise')
- `created_at` (timestamp)
- `updated_at` (timestamp)

**admin_stats**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `total_conversations` (integer)
- `total_messages` (integer)
- `last_active` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Storage**
- `chat-images` bucket for uploaded images (when not in anonymous mode)

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic stats updates via database triggers
- Secure cookie handling with @supabase/ssr

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
