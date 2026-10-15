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
- AI scanning lives in `src/lib/scan.functions.ts` (createServerFn, not edge functions) — keeps the key server-side and works without sign-in.
- The AI result JSON is validated server-side with one retry; errors return `{ok:false, code, message}` instead of throwing so the UI can show friendly text.
- Screenshots are compressed in the browser and sent inline, never stored — saves data on slow phones and avoids keeping sensitive images.
- Scan history is saved client-side into `scans` under RLS only when signed in.
