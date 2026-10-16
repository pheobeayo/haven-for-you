<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- AI scanning lives in `src/lib/scan.functions.ts` with authenticated createServerFn middleware — keeps the key server-side and rejects signed-out callers.
- The AI result JSON is validated server-side with one retry; errors return `{ok:false, code, message}` instead of throwing so the UI can show friendly text.
- Screenshots are compressed in the browser and sent inline, never stored — saves data on slow phones and avoids keeping sensitive images.
- Scan history is saved client-side into `scans` under RLS only when signed in.
- Mount the shared footer after the root Outlet inside LangProvider so every content page shares navigation and language state.
- Help content lives in separate leaf routes using HelpPage; footer links to existing home sections use stable section IDs to avoid duplicating those sections.
- Weekly trends come from anonymous scan_events (verdict, scam type, date only), written server-side after every successful authenticated scan to avoid retaining message content.
- App content routes live under the client-only authenticated layout; only account entry/recovery is public, so direct links also require sign-in.
- The root owns the single auth-state listener and shared account context; sign-out cancels queries, clears cache, and replaces navigation with account entry to prevent stale private views.
- Profiles store user-facing display names with own-row policies and an Auth signup trigger; privileges never come from profile metadata.
