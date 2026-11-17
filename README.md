# WriteNova – AI Blog Writer (MERN, JavaScript)

Enter a topic and keyword → pick an AI headline → get a structured draft → proofread grammar → check SEO → edit → save, copy or export.

## Stack
- **Frontend:** React 19 (ES modules, Vite), Tailwind CSS v4, Context API, React Router, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI:** Google Gemini API (called from the server only, your key never reaches the browser)
- **Auth:** 15-minute JWT access token (kept in memory) + 7-day refresh token in an httpOnly cookie, rotated on every refresh

## Run it
Requires Node 20+ and a MongoDB instance (local or Atlas). Get a free Gemini key at https://aistudio.google.com/apikey

```bash
# terminal 1
cd server && cp .env   # fill in MONGO_URI, secrets, GEMINI_API_KEY

PORT=5000
NODE_ENV=development
MONGO_URI=mongodb_url
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=change_me_access
REFRESH_TOKEN_SECRET=change_me_refresh
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash

npm install && npm run dev

# terminal 2
cd client && npm install && npm run dev   # http://localhost:5173
```

## Structure
```
server/
  server.js                 entry (connect DB, listen)
  src/app.js                express app, middleware, routes
  src/config/               db connection
  src/models/               User, Blog
  src/controllers/          auth, blog (CRUD), ai (headlines, generate, grammar, seo)
  src/routes/               auth, blogs, ai
  src/middleware/           protect (JWT), error handling
  src/services/             gemini client, SEO analyser
  src/utils/                tokens, asyncHandler, HttpError
client/src/
  api/                      axios instance (token + auto-refresh), service modules
  context/                  AuthContext, BlogContext
  hooks/                    useAuth, useBlog
  components/               AppShell, ProtectedRoute, BlockEditor, ProofPanel, AutoTextarea
  pages/                    AuthPage, Dashboard, Studio, Account
  utils/                    markdown / HTML export
```

## API
`POST /api/auth/register|login|refresh|logout` · `GET /api/auth/me` · `PUT /api/auth/password`
`GET|POST /api/blogs` · `GET|PUT|DELETE /api/blogs/:id`
`POST /api/ai/headlines|generate|grammar|seo`# WriteNova
