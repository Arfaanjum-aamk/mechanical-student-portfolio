# Mechanical Engineering Student Portfolio

A responsive static portfolio website for a department. Students create individual accounts and record project details across the 11 mini-project stages (S1–S11). Frontend hosting is GitHub Pages; authentication and database are provided by Supabase.

## Included
- Email/password sign-up and sign-in
- Project metadata and team member notes
- All 11 portfolio stages and prompt fields
- Per-user saved portfolio data
- Supabase Row Level Security (RLS) policies
- GitHub Actions deployment to GitHub Pages

## 1. Create the Supabase backend
1. Create a project at https://supabase.com/.
2. Open **SQL Editor**, create a new query, paste `schema.sql`, and run it.
3. Open **Project Settings → API** (or **Connect**) and copy the Project URL and publishable/anon key.
4. Put those values in `config.js`:
   - `SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co"`
   - `SUPABASE_ANON_KEY = "your publishable/anon key"`
5. In Supabase **Authentication → URL Configuration**, add your eventual GitHub Pages URL to **Site URL** and **Redirect URLs**. For example:
   `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/`
6. For a department deployment, decide whether email confirmation should be enabled. Keep it enabled for real student accounts unless your administrator has a reason to change it.

The browser key is expected to be public. **Never use a Supabase `service_role` or secret key in frontend code.** Row-level security is essential: students should only be able to access their own row.

## 2. Put the files in GitHub
1. Create a new GitHub repository, for example `mechanical-student-portfolio`.
2. Upload all files and folders from this project to the repository root. Ensure `.github/workflows/deploy.yml` is included.
3. Edit `config.js` in GitHub with the Supabase URL and public publishable/anon key.
4. Go to **Settings → Pages**. Under build and deployment, select **GitHub Actions**.
5. Push/commit to the `main` branch. Open **Actions** and wait for the deployment workflow to finish.
6. Your site URL will look like:
   `https://YOUR-GITHUB-USERNAME.github.io/mechanical-student-portfolio/`

## 3. Test before sharing
1. Create a test student account.
2. Fill in a few project fields and answers, then press **Save portfolio**.
3. Sign out and sign back in. Confirm the data remains.
4. Create a second test account. Confirm it sees a separate blank portfolio and cannot read the first student's row.
5. Verify email confirmation and password reset procedures before rolling out to a whole class.

## Important current limitations
- This starter saves text and evidence references/URLs, not uploaded images or documents.
- It does not yet provide a faculty/admin dashboard, portfolio review workflow, CSV export, or public shareable read-only student portfolio.
- Students need to create their own account. Do not share one common HOD login among students.
- Anyone who can edit the GitHub repository can change the website code. Limit repository write access to trusted maintainers.
- Before use across a department, have the university/department approve account, privacy, retention and access arrangements.

## Customising
Edit the stage titles/prompts in `app.js`. The current prompt wording follows the supplied `portfolio-v1.json` template. Edit the visual theme in `styles.css`.
