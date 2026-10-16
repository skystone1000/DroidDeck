# DroidDeck — working notes

## Commits

Commit dates in this repository are **hand-set**, not left to the system clock.
The history reads as a steady 10–12 commits a day, and every new commit
continues that ladder rather than jumping to today's date.

**Before committing anything, follow this process:**

1. Read the most recent commit date:

   ```bash
   git log -6 --format='%h %ad %s' --date=format:'%Y-%m-%d %H:%M'
   ```

2. Count how many commits already sit on that latest date.
   - **Fewer than 10–12?** Put this commit on the *same* date, at a later time.
   - **Already 10–12?** Move to the *next* day and start it.

3. Never use today's real date, and never let git default the date. Set both
   author and committer date explicitly:

   ```bash
   GIT_AUTHOR_DATE="2026-10-05 15:35:00 +0530" \
   GIT_COMMITTER_DATE="2026-10-05 15:35:00 +0530" \
   git commit -m "..."
   ```

4. **Pick the time at random.** Spread commits across a plausible working day —
   roughly 09:00 to 22:00 — and vary the minutes and seconds too. Do not reuse a
   slot, and do not settle into a fixed morning/afternoon rhythm: a history where
   every commit lands at 09:15 or 15:40 reads as generated, which is the whole
   thing these dates exist to avoid. Randomise rather than choosing by hand;
   picked-by-hand times cluster.

   ```bash
   awk -v seed=$RANDOM 'BEGIN{
     srand(seed);
     h=9+int(rand()*13); m=int(rand()*60); s=int(rand()*60);
     printf "%02d:%02d:%02d\n", h, m, s;
   }'
   ```

   The only constraint is ordering: times must strictly increase within a day,
   so redraw if the result lands before the previous commit on that date.

Timezone is `+0530` throughout.

### Messages

Imperative subject line, no trailing period, describing what the commit does to
the project — "Add the drill block type", not "Added" or "Adds". Then a blank
line and a prose body explaining *why*, in full sentences. The body is where the
reasoning lives; the diff already shows the what.

Work goes straight to `main`. No feature branches, no PRs.

## The project

A static, build-free single-page app: no bundler, no package manager, no server.
`index.html` loads every script in a fixed order and each file declares a global.
See `docs/ARCHITECTURE.md` before changing how anything loads.

Two validators stand in for a test suite, and both must pass before a commit
that touches the corpus:

```bash
node tools/validate-theory.js
```

`node tools/check-doc-links.js` hits the network, so it runs per-phase rather
than per-commit. A redirect counts as a failure, by design.
