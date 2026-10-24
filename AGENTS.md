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

## Project rules
- Verifix is frontend-only; all data goes through `src/lib/api.ts` (`VerifixApi` with mock + http impls, chosen by VITE_USE_MOCK) — the real backend is an external FastAPI server.
- All server data is read via TanStack Query hooks in `src/hooks/useVerifix.ts`; never fetch directly in components.
- Routing uses TanStack Router file routes (react-router is not supported in this stack).
- Badge colors come from `tone-*` utilities in `src/styles.css`.
- Shared surfaces, shadows, icon glows, and action gradients use semantic tokens in `src/styles.css`; gradient actions use the shared Button premium variant to keep presentation consistent.
