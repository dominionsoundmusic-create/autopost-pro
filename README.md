# AutoPost Pro — Deployment Guide

## What's in this folder

- `index.html` — service landing page (deploy to Netlify)
- `onboard.html` — client onboarding form (deploy to Netlify)
- `agent.js` — the daily posting server (deploy to Render.com)
- `package.json` — Node.js config

---

## Step 1: Deploy the website to Netlify

1. Go to netlify.com and log in
2. Drag the `index.html` and `onboard.html` files to Netlify
3. Connect your domain (e.g. autopostpro.com or add a page to dominionSoundmusic.com)

---

## Step 2: Deploy the agent to Render.com

1. Go to render.com and create a free account
2. Click **New → Web Service**
3. Upload or connect this folder
4. Set the start command to: `node agent.js`
5. Add these environment variables:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `DS_PAGE_ID` | Dominion Sound Facebook Page ID |
| `DS_PAGE_TOKEN` | Dominion Sound Page Access Token |
| `KSB_PAGE_ID` | Kidstorybooks Facebook Page ID |
| `KSB_PAGE_TOKEN` | Kidstorybooks Page Access Token |
| `RUN_ON_START` | `false` (set to `true` to test immediately) |

6. Click **Deploy** — it runs free 24/7

---

## Step 3: Add new clients

When a client signs up and pays, add them to the `CLIENTS` array in `agent.js`:

```js
{
  id: 'client-business-name',
  name: 'Business Name',
  fbPageId: 'their-page-id',
  fbToken: 'their-page-token',
  bio: 'Description of their business...',
  website: 'theirwebsite.com',
  topics: ['music', 'engage'],
  postsPerDay: 1,
}
```

Then redeploy on Render.com (one click).

---

## Getting a Facebook Page ID

To find a client's Page ID:
1. Go to: `https://graph.facebook.com/v19.0/me/accounts?access_token=THEIR_TOKEN`
2. The `id` field in the response is their Page ID

---

## Testing

Visit: `https://your-render-url.onrender.com/health`
To trigger a manual post: `POST https://your-render-url.onrender.com/run`
