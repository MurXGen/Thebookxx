# Daily Command Center: setup (5 minutes)

Two dashboards in one web app, **TheBookX** and **Art of Clarity**, each with daily check-in/check-out, a timetable, weekly targets, goal tracking and insights. Everything is saved to your Google Sheet.

## 1. Paste the code
1. Open the sheet → **Extensions → Apps Script**.
2. Replace everything in `Code.gs` with [Code.gs](Code.gs).
3. Click **+ → HTML**, name it exactly `Index`, and paste [Index.html](Index.html).
4. Save (⌘S).

## 2. Create the tabs (one time)
1. In the function dropdown pick **setup** → **Run**.
2. Approve the permissions prompt (Advanced → Go to project → Allow).
3. Your sheet now has five new tabs: `DB_Tasks`, `DB_TaskLog`, `DB_CheckIns`, `DB_Goals`, `DB_GoalLog`. Your existing tabs are not touched.

## 3. Deploy
1. **Deploy → New deployment → ⚙ → Web app**.
2. Execute as: **Me** · Who has access: **Only myself**, or **Anyone in your organisation** for a team.
3. Copy the **Web app URL**.

Two bookmarks, one for each dashboard:
- `<URL>?d=bookx` opens TheBookX
- `<URL>?d=clarity` opens Art of Clarity

On your phone, open the URL in Chrome/Safari → **Share → Add to Home Screen** to get an app icon.

> After changing the code later: **Deploy → Manage deployments → ✎ → Version: New version → Deploy**. The URL stays the same.

## Editing your plan in the sheet
| Tab | What to edit |
|---|---|
| `DB_Tasks` | `Day` = `Daily`, `Mon`…`Sun`, `Weekly`, or a date `2026-11-20` (one-off). `Time` = `08:00`. Set `Active` to `FALSE` to hide a task. |
| `DB_Goals` | Change `Target`, `Start`, `End` (yyyy-mm-dd). Pace ("ahead/behind", "need X/day") is calculated from these. |
| `DB_TaskLog`, `DB_CheckIns`, `DB_GoalLog` | History written by the app. Leave as-is. Good for pivot tables. |

## Built-in fixes for common problems
- **Slow Apps Script loads:** the last data shows instantly from the phone's cache and refreshes in the background.
- **Bad network:** every tick is saved locally and retried automatically ("Offline · N pending" chip). Nothing is lost.
- **Mis-taps:** every action has **Undo**.
- **Couldn't do a task:** **⋯ → Skip today**. Skipped tasks don't count against your % or streak.
- **A task keeps slipping:** Insights → *Fix the friction* flags anything missed 3+ times in 14 days, with one-tap time change.
- **Unfinished work:** check-out offers to carry non-daily tasks to tomorrow.
- **Shortcuts (desktop):** ← → change day, `t` today, `n` new task, `Esc` close.

Streak rule: a day counts when at least **60%** of its (non-skipped) tasks are done.
