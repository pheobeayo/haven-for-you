# Shine Your Eye

PRODUCT: Shine Your Eye — an AI scam checker for Nigerians.
Users paste text, upload a screenshot, or enter a link/crypto address and get a verdict before they send money or goods.

PRIMARY USERS: market traders, shop owners and POS agents checking bank credit alerts; their parents and grandparents on WhatsApp. Many are not tech-savvy and use cheap Android phones on slow data.

DESIGN RULES
- Mobile first (360px wide), large tap targets, high contrast, minimal text per screen.
- Plain English, short sentences. Optional Nigerian Pidgin for all results.
- Verdict colours: red = Likely scam, amber = Be careful, green = Looks safe. Always show the word, never colour alone.
- Friendly, calm tone. Never shame the user.

TECH RULES
- Use Lovable Cloud for database, auth, storage and edge functions.
- All AI calls go through an edge function using Lovable AI. Never call AI or expose keys from the browser.
- Default model: Gemini 3 Flash (supports images).
- The AI must return JSON only, in this shape:
  { "verdict": "scam" | "suspicious" | "safe",
    "risk_score": 0-100,
    "scam_type": string,
    "red_flags": [ { "flag": string, "evidence": string } ],
    "what_to_do": [string],
    "explanation_en": string,
    "explanation_pcm": string }
- Validate the JSON in the edge function; if it fails, retry once, then show a friendly error.
- Handle 429 (too many requests) and 402 (AI balance empty) with clear messages.

SAFETY RULES
- Never ask users for PINs, passwords, OTPs or full account numbers.
- Every result shows: "This is an AI opinion, not a guarantee. When in doubt, confirm with your bank app directly."
- Scanning works without sign-up. Sign-in is only needed to save history.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://shine-your-eye.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/459a7b0b-6e5b-4e1e-9cfa-f473e0a0b5d8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
