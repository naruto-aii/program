# Training Menu AI

This project is a Next.js application that generates personalized strength training programs based on NSCA guidelines using the Gemini API. It also includes user authentication and data persistence via Supabase.

## Features

*   **AI-Powered Generation**: Uses Google's Gemini 2.0 Flash model to create 4-week training cycles tailored to user input.
*   **NSCA Compliance**: Enforces strict guidelines (Power -> Core -> Assistance order, Deload weeks).
*   **User Authentication**: Google OAuth login via Supabase.
*   **Data Persistence**: Saves generated menus and user 1RM (One Rep Max) data to Supabase.
*   **Responsive UI**: Modern interface built with Tailwind CSS.

## Setup

1.  **Clone the repository.**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env.local` file with the following:
    ```
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  **Database Setup**:
    Run the SQL commands in `supabase_schema.sql` in your Supabase project's SQL Editor to set up the tables and RLS policies.
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Deployment

The project is configured for deployment on Vercel. Ensure all environment variables are set in the Vercel project settings.
