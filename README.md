# WannaWatch - Movie Matching App

A React web application that helps groups of friends decide what movie to watch together using a Tinder-style swipe interface.

## Features

- **User Authentication**: Sign up/in with email or Google OAuth
- **Movie Management**: Add movies manually or import from CSV
- **TMDB Integration**: Rich movie metadata with posters and details
- **Watch Status Tracking**: Mark movies as watched with 1-5 star ratings
- **Fuzzy Matching**: Intelligent movie matching to prevent duplicates
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **APIs**: TMDB for movie data
- **Deployment**: Netlify (Web)

## Setup Instructions

### Prerequisites

- Node.js 16+
- Supabase account
- TMDB API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wannawatch
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase and TMDB credentials in the `.env` file.

4. Set up Supabase database:

Create the following tables in your Supabase project:

```sql
-- Users table (handled by Supabase Auth)
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Movies table
CREATE TABLE public.movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  metadata jsonb NOT NULL,
  watched boolean NOT NULL DEFAULT false,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, title)
);

-- Watch groups table
CREATE TABLE public.watch_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Group members table
CREATE TABLE public.group_members (
  group_id uuid REFERENCES public.watch_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY(group_id, user_id)
);

-- Sessions table
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id uuid REFERENCES auth.users(id),
  group_id uuid REFERENCES public.watch_groups(id),
  movie_ids uuid[] NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Session votes table
CREATE TABLE public.session_votes (
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES public.movies(id),
  vote boolean,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY(session_id, user_id, movie_id)
);
```

5. Enable Row Level Security (RLS):

```sql
-- Enable RLS on all tables
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own movies" ON public.movies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movies" ON public.movies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movies" ON public.movies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own movies" ON public.movies
  FOR DELETE USING (auth.uid() = user_id);
```

6. Start the development server:
```bash
npm run dev
```

## CSV Import Format

When importing movies via CSV, use the following format:

```csv
title,year
Inception,2010
The Matrix,1999
Pulp Fiction,1994
```

Required columns:
- `title`: Movie title (required)

Optional columns:
- `year`: Release year
- `director`: Director name
- `cast`: Cast members

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TMDB_API_KEY=your-tmdb-api-key
```

## Deployment

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Build Settings

```toml
[build]
  command = "npm run build"
  publish = "dist"

[context.production.environment]
  VITE_SUPABASE_URL = "https://your-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your-anon-key"
  VITE_TMDB_API_KEY = "your-tmdb-key"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.