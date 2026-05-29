# Google & GitHub OAuth Integration Setup Guide

For the **Google** and **GitHub** sign-in buttons to function properly, you must configure the OAuth apps in their respective developer consoles and link them inside your active **Supabase Dashboard**.

---

## 🛠️ Step 1: Add Localhost to Supabase Redirect URL Allowlist

Before configuring Google and GitHub, you must tell Supabase that your local dev origin is authorized to receive authentication tokens.

1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** -> **URL Configuration** (in the sidebar).
3. Under **Redirect URLs**, click **Add URL**.
4. Enter your local development server origin, e.g.:
   - `http://localhost:5173`
   - `http://localhost:5173/`
5. Click **Save**.

---

## 🔑 Step 2: Configure Google OAuth Client Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project (or create a new one).
3. Navigate to **APIs & Services** -> **Credentials**.
4. Click **Configure Consent Screen** if you haven't done so yet. Set User Type to **External**, enter your App Name and Email, and save.
5. Back in the **Credentials** tab, click **+ Create Credentials** -> **OAuth client ID**.
6. Select Application type: **Web application**.
7. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
8. Under **Authorized redirect URIs**, enter your Supabase OAuth Callback URL. You can find this in your Supabase Dashboard under Auth -> Providers -> Google, or construct it as follows:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
9. Click **Create** to obtain your **Client ID** and **Client Secret**.
10. Go to your **Supabase Dashboard** -> **Auth** -> **Providers** -> **Google**.
11. Paste the **Client ID** and **Client Secret**, enable the provider, and click **Save**.

---

## 🐙 Step 3: Configure GitHub OAuth Credentials

1. Sign in to your [GitHub Account](https://github.com/).
2. Go to **Settings** (click your profile image -> Settings).
3. Scroll down on the left sidebar and click **Developer Settings**.
4. Select **OAuth Apps** and click **New OAuth App**.
5. Fill in the fields:
   - **Application name**: `Goal Glimpse` (or any custom name)
   - **Homepage URL**: `http://localhost:5173` (or your production URL)
   - **Authorization callback URL**: Enter your Supabase callback URL:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Click **Register application**.
7. Copy the **Client ID**.
8. Click **Generate a new client secret** and copy it.
9. Go to your **Supabase Dashboard** -> **Auth** -> **Providers** -> **GitHub**.
10. Paste your **Client ID** and **Client Secret**, enable the provider, and click **Save**.

---

## 🔍 Verification

Once configured:
1. Ensure your `.env.local` contains your active `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Run `npm run dev` and click the **Google** or **GitHub** buttons.
3. You should be successfully redirected to the Google/GitHub consent screen and returned to your local dashboard upon verification.
