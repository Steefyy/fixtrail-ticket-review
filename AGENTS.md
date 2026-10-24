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
- The application is frontend-only; all data goes through `src/lib/api.ts` (`AfterCheckApi` with mock + http impls, chosen by VITE_USE_MOCK) — the real backend is an external FastAPI server.
- All server data is read via TanStack Query hooks in `src/hooks/useVerifix.ts`; never fetch directly in components.
- The frontend renders a single dashboard perspective without role context; the root clears obsolete preferences through a tested browser-safe migration, while API compatibility fields and report diagnostics remain unchanged.
- Routing uses TanStack Router file routes (react-router is not supported in this stack).
- Badge colors come from `tone-*` utilities in `src/styles.css`.
- Shared surfaces, shadows, icon glows, and action gradients use semantic tokens in `src/styles.css`; gradient actions use the shared Button premium variant to keep presentation consistent.
- Ticket filtering and verification eligibility live in browser-safe pure helpers, while the ticket route owns URL state and its shared Sheet owns details; this keeps API data unchanged and rules independently testable.
- Ticket quick filters compose with advanced filters in the existing pure helper; a direct filter-panel component reuses the same controls in a desktop Popover and mobile Sheet so URL state remains the single source of truth.
- Overview priority cards reuse the cluster comparator and verdict helper, and open the shared TicketDetails Sheet; this avoids duplicate priority rules and detail workflows.
- Fields that hold only a calendar date (`dataDeschiderii`, `dataLivrareFix`) render `dd.MM.yyyy` through `src/lib/dates.ts` without building a `Date`, so the day never shifts across timezones; only fields that carry a time show one.
- The large capture of a failed step renders at full width with `object-contain` and natural height — never `object-cover` or a max-height — because the error message sits at the bottom of the screenshot and must stay visible.
