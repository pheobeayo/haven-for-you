# Haven

Haven helps adults in Nigeria respond safely when they are worried about a child. Mothers, caregivers, teachers, youth leaders and community health workers say what they noticed, in text or by choosing from a list. Haven asks a few scripted questions, shows how urgent the situation is, and gives approved next steps and people who can help.

A child does not need a phone or internet access for Haven to help them.

> **Status: test version.** The guidance is seeded from published sources and is pending review by a child protection professional. Do not use it for a real case. See [docs/content-review.md](docs/content-review.md).

## How it stays safe

- **AI routes. People's words speak.** The model can only return fixed labels for category and emergency. Any other output is discarded, and it never writes advice.
- **Works without AI.** Rules in `src/lib/triage.ts` and the scripted questions run on their own. If AI fails, is slow or hits its spending cap, people still reach the guidance.
- **Emergencies can't be downgraded.** AI can raise a concern to an emergency, but it can't clear one the rules found. When the rules find an emergency, Haven shows it at once and sends nothing to AI.
- **No images, ever.** There is no upload path in the app, and a test fails if one is added.
- **Nothing kept.** There is no database of concerns and no logging of what people write. Optional frontline accounts hold profile details only and are never linked to a concern. Phone numbers and email addresses are removed before text goes to the AI service.
- **Private to use.** The journey stays on one address and in memory.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/content/guidance.ts` | Questions and the response library, in English and Pidgin |
| `src/content/contacts.ts` | Referral directory, with the source of each contact and the date it was confirmed |
| `src/lib/triage.ts` | Emergency rules, category rules and validation of AI output |
| `src/lib/route-concern.server.ts` | The AI routing call and its spending cap |
| `src/components/haven/` | The intake, question, guidance and contact screens |

## Run it

```sh
bun install
bun run dev
bun run test
```

Copy `.env.example` to `.env` for local work. Without `GEMINI_API_KEY`, Haven uses its rules. Without the Supabase values, accounts are off, but getting help still works.

## Deploy to Vercel

1. Create a Supabase project. Haven needs no tables, because account details are stored in Supabase Auth.
2. In Supabase, set the Site URL to your Vercel address, and add `<your address>/**` to the redirect URLs.
3. Create a Gemini API key with billing turned on. Google's free tier must not receive sensitive information.
4. Import this repository at vercel.com/new and keep the TanStack Start preset.
5. Add every variable in `.env.example`, then deploy. `GEMINI_MODEL` is optional.

## Licence

Code is released under the [MIT licence](LICENSE). Haven's own guidance text is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Published sources belong to their authors and are listed in the app.

