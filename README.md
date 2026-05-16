# SitemapAudit — Free XML Sitemap SEO Audit Tool

> Auto-fetches your sitemap, checks every URL for Google indexing issues, delivers an AI expert SEO report in 10 seconds. No login required.

🔗 **Live:** https://sitemap-audit-six.vercel.app

---

## Deploy to Vercel in 60 seconds

```bash
# 1. Clone / download this folder
# 2. Push to GitHub
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sitemapaudit.git
git push -u origin main

# 3. Go to vercel.com → New Project → Import from GitHub → Deploy
# That's it. No build step, no config needed.
```

---

## Project Structure

```
sitemapaudit/
├── public/
│   └── index.html        ← Complete frontend (single file, no framework)
├── api/
│   └── fetch-sitemap.js  ← Vercel Edge Function (server-side sitemap fetch)
├── vercel.json           ← Vercel config
├── package.json          ← Node 18+ requirement
└── README.md
```

---

## How It Works

```
User enters URL
  → /api/fetch-sitemap (Vercel Edge, real Chrome headers, bypasses Cloudflare)
  → Falls back to 6 CORS proxies in parallel (fastest wins)
  → Checks robots.txt for Sitemap: declarations
  → Tries 9+ sitemap URL patterns (www and non-www variants)
  → Handles sitemap index (merges child sitemaps)
  → XML parsed → URLs classified → health score calculated
  → AI analysis via Groq (free tier, no API key needed)
```

---

## Features

- ✅ Auto-fetches sitemap (no copy-pasting ever)
- ✅ Cloudflare bypass via server-side Edge function
- ✅ Sitemap index support (auto-merges child sitemaps)
- ✅ 0-100 health score with animated ring
- ✅ URL-level indexing classification
- ✅ AI expert SEO analysis (Groq llama-3.3-70b)
- ✅ Priority fixes ranked by impact
- ✅ CSV export
- ✅ Share score (LinkedIn + Twitter + copy link)
- ✅ No login, no signup, no credit card
- ✅ Full SEO optimisation (Schema.org, FAQ rich results, star ratings)
- ✅ Mobile responsive (3 breakpoints)

---

## Environment Variables

None required. The Groq API key is embedded for demo purposes.

For production, add to Vercel dashboard:
```
GROQ_API_KEY=your_key_here
```

---

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (no framework, no build step)
- **Backend:** Vercel Edge Functions
- **AI:** Groq API (llama-3.3-70b-versatile)
- **Fonts:** Instrument Serif + Syne + JetBrains Mono
- **Deploy:** Vercel (free tier works perfectly)

---

## License

MIT — free to use, modify, and deploy.
