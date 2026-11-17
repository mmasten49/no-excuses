# The solution

## In one sentence
**No Excuses** is a phone web app where you name the two habits you want to cut, log each purchase in a few taps, and it shows how many purchases you have left this week before you hit a limit that drops every 4 weeks, until you're spending half.

> **The app is general.** At setup, the user names their two habits and picks an emoji for each (up to 16 characters per name). Matthew's two are **Pizza 🍕** and **Cash 💵**. They're used as the example throughout this file and in the public web page and ad. Everywhere this file says "Pizza" or "Cash," the app shows whatever names the user chose.

## What someone does with it
1. **Open it the first time.** Pick the Monday that block 1 starts. That's the only setup.
2. **Block 1 (weeks 1–4) is measuring only.** After every pizza or cash purchase, open the app, tap **+ Pizza** or **+ Cash**, type the amount and tap **Save**. That takes under 30 seconds. There are no limits yet. The home screen shows running totals.
3. **When block 1 ends**, the app sets the starting number for each category (the block-1 total) and works out the weekly limits.
4. **From block 2 on**, the home screen shows, for each category, how many dollars are left this week and how many **purchases left**.
5. **Before buying**, open the app and check how many purchases are left. After buying, log it the same way as in step 2.
6. **Every Monday at 8:00 AM**, the weekly limit resets. **At the end of every block**, the limit drops 10 points of the starting number, **whether or not you hit the target.** This is on purpose: no repeats, no second chances. The app shows whether you hit or missed, and the schedule keeps moving.
7. **Break weeks (Thanksgiving, Christmas, travel):** tap **Skip this week** on Home. Nothing gets logged that week and it doesn't count toward anything. The block gets one week longer to make up for it.
8. **After block 6** (counted weeks 21–24), the block-end message says, for each category, whether you finished at or under 50% of your starting number. The 50% limit keeps running after that.

## The screens

### Navigation (on every screen after Setup)
- **Bottom tab bar:** **Home · History · Habits · Plan.** Tap any tab to switch. The current tab is red.
- **"⚙️ Add, change or import habits"** links on Home and Plan jump straight to the Habits tab.
- **Saved pill** in the top right corner: "✓ Saved 4:40 PM," showing the time of the last save. It turns red and says "Not saving" if the browser refuses to store data. Tap it to jump to "Your data" on Plan.

### 1. Setup (first open only)
- **Step 1, Your two habits:** two name fields ("e.g. Pizza," "e.g. Coffee"), each with a row of 12 emoji to pick from. Below them is an optional **Your why** field, up to 40 characters ("e.g. Spring break fund"). **Next** stays disabled until both habit names are filled in.
- **On step 2, if this week's (already started) Monday is picked,** a red heads-up appears: buys from before today won't be logged, so the starting number may come out low. It recommends starting next Monday instead.
- **Step 2:** a **‹ Back** link, then a short 3-step explanation of the plan, then a list of 5 Mondays (this week's, plus the next 4). Next Monday is preselected.
- **Tap a Monday:** selects it.
- **Tap "Start the plan":** saves and goes to Home. This screen never shows again.

### 2. Home
- **Top:** "Block 3 · week 2 of 4" with a big "80% limit" (or "Measuring" in block 1), plus a "Resets in 3d 15h" countdown and a thin bar showing how far through the week you are.
- **Block-end message:** shown once, on the first open after a block ends. Each category shows **HIT IT** or **MISSED BY $14**, then "New limit: 80%." Tap **Let's go** to close it.
- **Two cards, Pizza and Cash.** Each one has a **progress ring** that fills as you spend toward the weekly limit. Inside the ring is the number of purchases left, which is the biggest text on the screen. Next to the ring:
  - **A headline:** "2 Pizza buys left," "Last one this week," "Done for the week," or "Over by $12" (the card turns red when you're over).
  - **Dollars left:** "$18 of $54 left."
  - **Pace warning:** if you've used at least half the limit **and** your share of the limit used is more than 25 points ahead of your share of the week gone by, a line appears: "⚠️ 81% used, 4 days in." It compares dollars against days, not purchase timestamps, so logging late doesn't break it. It's hidden once you're over the limit or out of buys.
  - **If a habit has no average yet** (nothing logged in block 1), the headline shows "$X left this week" instead of a buy count.
  - **In block 1:** the ring shows how far through the week you are, the center shows dollars spent this week, and the headline shows dollars spent this block.
- **Two stat tiles (block 2 and later):**
  - **🔥 Streak:** finished weeks in a row with both categories under the limit, plus your best streak.
  - **💰 Money kept:** how much less you've spent than your old pace (starting number ÷ 4 per week), added up over finished weeks. It's red if negative.
- **✋ Resisted this week:** a tile showing how many times you held off this week and the dollars you didn't spend.
- **Two big buttons: + Pizza and + Cash.** Tapping one slides up the Log Purchase sheet.
- **"✋ I want one. Help me wait." (the resist button):**
  - Tap it and pick the habit. Each option shows its usual cost, and the work time if your pay is set.
  - A **10-minute countdown** banner appears at the top of Home, with an **I caved** button. If a why is set, the banner also says **"Remember: Spring break fund."**
  - **If the 10 minutes run out:** it's a win. A "You held off · +$21 not spent" confirmation shows, and it's added to the Resisted tile. The win is worth that habit's average buy ($20 until there's history).
  - **If you tap I caved, or log a buy of that habit during the countdown:** it's marked lost, and I caved opens the log sheet with the usual amount filled in.
  - The countdown keeps going if the app is closed. A win is counted the next time the app opens.
- **"📲 New week" banner (Monday and Tuesday only):** "Send last week's numbers to the person who keeps you honest." **Send** opens the phone's share sheet (Messages, etc.) with the text report. **✕** dismisses it for that week. It appears once per finished week, and not for skipped weeks.
- **Skip line:** "Break week? Skip this week · 1 skip left this block." It's only shown if nothing has been logged yet this week **and** this block's one skip hasn't been used. Below it, in small text: "1 skip left this block" or "Skip used this block."
  - Tap it and a prompt appears: "Skip this week? Nothing gets tracked until Monday 8 AM, and this week won't count toward your block." The options are **Skip** and **Cancel**.
  - After Skip, the cards are replaced with "Skipped week, back Monday 8 AM," the + Pizza and + Cash buttons are hidden, and an **Undo skip** link appears. Undo is available until the week ends.

### 3. Log Purchase (a sheet that slides up from the bottom)
- **Shows:** a Pizza / Cash switch, a big dollar amount, **3 quick-amount buttons** (your 3 most-used amounts for that category; until you have history, $15/$20/$25 for pizza and $20/$40/$60 for cash), and a number keypad. The date and time are filled in automatically.
- **Before saving**, a line under the amount says what happens: "After this: 0 pizza buys left this week" or "This puts you over by $6." If your pay is set, a second line says **"= 1.3 hours of work."**
- **Tap Save $19:** saves, closes the sheet, and shows a checkmark confirmation ("Logged $19 · 1 Pizza buy left this week"). The phone vibrates on phones that support it.
- **Undo bar:** for 6 seconds after saving, a bar above the tabs says "🍕 Pizza · $19 logged" with an **Undo** button. Undo removes that buy, and restores any resist countdown the buy had cancelled.
- **Tap Cancel or the dark area behind the sheet:** closes it and saves nothing.

### 4. History
- **Week navigator:** **‹ Back** and **Next ›** buttons on either side of the week title ("This week," "Last week," "Week of Nov 16"), with dates and block below. Swiping left or right also works. You can't go before week 1 or past this week. When you're viewing a past week, a **"Jump to this week"** button appears.
- **Week summary:** for each category, dollars spent against the limit with a progress bar, and **Under ✓**, **On track**, or **Over by $X**. Skipped weeks say so.
- **📲 Send this week (the accountability text):** opens the phone's share sheet with a plain-text report for the week being viewed. If the phone can't share, it copies the report instead. The report includes:
  - the week and block
  - each habit: spent of limit, ✅ or ❌ over by $X
  - times resisted
  - the streak and money kept
  - "Keep me honest."

  There are no accounts, nothing is sent to a server, and you pick who gets it.
- **Purchases:** that week's purchases, newest first, each with category, amount, and day/time, plus a trash button. Tapping trash asks "Delete this?" first. There's no edit. Delete it and log it again.

### 5. Habits (new tab)
- **Your habits:** one card per habit, with its emoji, its name, and its status ("90% limit · $54/week" or "Measuring · week 2 of 4 · $30 so far"). Each card has **Edit** and **✕** (delete).
  - **Edit:** name, emoji, and **statement words**, the comma-separated words that mark a statement line as this habit. They're pre-filled from the name. For example, Pizza → pizza, domino, papa john, larosa… and Cash → atm, withdrawal.
  - **✕ Delete:** confirms first and says how many logged buys go with it. Other habits aren't touched. The last habit can't be deleted.
- **+ Add a habit** (up to 5 total): name and emoji. The emoji is guessed from the name as you type (Coffee → ☕) until you pick one. **A habit added after the plan starts joins this week and gets its own 4 measuring weeks** (this week counts as week 1). Then its limit starts at 90% and drops every 4 of its own counted weeks. Buys logged for it before it joined don't count.
- **Your why:** edit it here.
- **Import a statement:**
  - **Choose a statement file** (CSV, TXT or PDF) or **Paste transactions.**
  - Everything is read on the phone. Nothing is uploaded. PDFs use pdf.js, a free library loaded from cdnjs only when a PDF is opened. CSV works offline.
  - **The parser handles:**
    - CSVs with an Amount column, either sign convention (Chase: purchases negative; Amex/Discover: purchases positive)
    - Debit/Credit columns (Capital One)
    - files with no header row
    - pasted or PDF text with one transaction per line: a date first (11/03, 11/03/2026, 2026-11-03, Nov 3), an optional second posting date, and the first money value after the description (a later value is treated as a running balance)
  - **It drops:** payments, refunds, transfers, deposits and payroll. Repeated identical lines are kept as separate buys.
  - **The results sheet, "Where your money went":**
    - totals for all card buys and for buys on your habits (with the percentage)
    - per habit: matched buys, total, **about $X/week on this statement** next to your own logged pace, and a checkbox list of the buys
    - **Where the rest went:** the top 8 unmatched merchants, each with a "Count as [habit]" picker that adds that merchant to the habit's statement words and re-sorts on the spot
  - **"Add N buys to my log"** adds the checked, matched buys dated by the statement. It skips duplicates (from earlier imports), anything before the plan started, and anything before that habit joined, and the sheet says how many were skipped and why.
  - **Undo:** the last 3 imports are listed with **Undo**, which removes only that import's buys.
  - **Cash note:** cash buys never appear on card statements, but ATM withdrawals do and match a cash habit.

### 6. Plan
- **The ladder:** blocks 1–6 (more if you're past 6), each with its percentage, its weekly limit for each category, and a status: **NOW**, **DONE**, or a ✓/✗ for each category in finished blocks. It also notes when a block's skip was used.
- **Starting numbers:** the block-1 total for each category (marked "so far" during block 1), plus your best streak and money kept.
- **At this pace:** for each habit, the yearly cost based on the last 4 finished, non-skipped weeks × 52, next to "was $X" (your old pace, starting number ÷ 4 × 52) and, if pay is set, the hours of work.
- **Cost in hours:** a $/hour field. Once it's set, buys, resists and yearly pace also show as work time ("1.3 hours," "20 min"). Leave it blank to turn it off.
- **Your data:**
  - **Saved on this phone:** the last save time.
  - **How many purchases are stored.**
  - **Whether the browser has agreed to protect the data from automatic cleanup.**
  - **A plain-English explanation of what survives:** closing the app and restarting the phone. What doesn't: clearing browser data or switching browsers.
  - **Download backup:** saves a `.json` file with everything. On phones that support sharing files, it opens the share sheet ("Save to Files," AirDrop, etc.), which works better than a download from a home-screen app. Otherwise it downloads the file.
  - **Restore from backup:** pick that file, see what it contains, confirm, and it replaces what's on the phone. A file that isn't a valid backup is rejected and nothing changes.

### Demo mode (for testers and anyone just looking)
- **Two ways in:**
  - a **"👀 Just looking? Try it with sample data"** button on setup step 1
  - the link **`app/?demo=1`**, which the landing page's "Try the demo" buttons use
- **The link never overwrites a real plan.** If the phone already has a real plan, `?demo=1` is ignored and the real plan opens.
- **The sample plan is always the same**, no matter what day it's opened:
  - block 2, week 3, at the 90% limit
  - Pizza 🍕: $54 a week, Cash 💵: $36 a week
  - this week so far: **2 Pizza buys left**, and Cash at $21 of $36
  - a 2-week streak, pay set to $15 an hour, and why set to "Spring break fund"
  - **Logging a ~$19 Pizza buy → "1 Pizza buy left · Last one this week."** That's the classmate test task.
- **A yellow bar under the header,** "👀 Demo · sample data," shows on every screen with a **Start for real** button. That button asks first, then clears the sample data and goes to setup.

### Auto-log, goal jar, report card (added Nov 17)
**Quick-log links (auto-log).**
- `app/?log` opens the log sheet pre-filled:
  - `?log=Pizza` (a habit name or id) picks the habit
  - `&amount=19.42` fills the amount ("$19.42", "19,42" and "1,204.50" all work; junk, 0 and anything over $9,999 are ignored)
  - `&merchant=…` is shown on the sheet, picks the habit using its statement words, and is saved with the buy
- **It never saves on its own.** A dark bar on the sheet says "From a quick-log link: [store]. Check it, then tap Save. Nothing is saved until you do." If the store doesn't match a habit, it says to pick one.
- **The link is cleared after opening,** so a reload won't open the sheet again.
- **Saved buys** carry `src: 'quicklog'`, and History shows "⚡ [store]."
- **Duplicate protection:** statement import still treats these as hand-logged buys, so it won't count them twice.
- **Habits tab → Auto-log → "Set up auto-log"** opens a guide in the sheet:
  - 5 steps for an iPhone **Shortcuts → Automation → Wallet** automation (iOS 17+): Run Immediately → URL Encode (Merchant) → Open URLs `…/app/?log&amount=AMOUNT&merchant=MERCHANT`
  - a Copy button for that link
  - per-habit **one-tap links** (`?log=Pizza`) for Back Tap or NFC stickers, which cover cash and card swipes
  - **This is unverified on a real iPhone.** The Shortcuts steps are written from Apple's documented Wallet automation.

**Goal jar.**
- **Setup:** on the Habits tab, under "Your why & goal jar," add an optional goal amount (for example, $400).
- **The jar only counts money the user says they moved.** The app can't see a bank, so it never guesses or auto-counts.
- **Home:** one slim bar, "🎯 Spring break fund · $36 of $400," that turns red at 100%. Tapping it opens the goal sheet:
  - add a move ("I moved it")
  - the last 5 moves, each with ✕ to remove it
  - Change goal
- **The Monday prompt is part of the single "New week" banner (Monday and Tuesday):** "You kept $46 last week. Move it to your [why]?"
  - The suggestion is last finished week's money kept, never negative, and only for weeks that had limits.
  - **💰 Move $46** asks for confirmation ("Open your bank app and move it, then tap I moved it").
  - **📲 Send** sends the report card.
  - **✕** dismisses both for that week.
  - The move offer shows at most once per week.
- **Elsewhere:**
  - the log sheet shows "· 5% of your [why]"
  - the share text includes the goal line
  - reaching the target shows a "Goal hit." screen

**Report card link.**
- **📲 Send** (History, and the Monday banner) shares a link to `web/card.html#…`.
- **The week's summary is packed after "#",** so it's never sent to a server. It contains:
  - each habit: emoji, name, spent, limit, %
  - streak, money kept, resists
  - why and goal
  - **no purchase list and no buy timestamps**
- **The card page** shows: Week of / Plan week, a bar plus ✅/❌ for each habit, streak / kept / resisted, the goal bar, "Keep them honest," and links to the landing page and demo. Demo data is badged.
- **Safety:** every field from the link is validated and clamped, and shown as plain text only. A broken or tampered link shows "This link is incomplete."
- **Fallback:** if the phone can't share, it copies the text plus the link.

### Installing and offline use
- **Add to Home Screen** gives a real app icon (a red "NE." square) and opens full screen, with no browser bars.
- **Works offline after the first visit.** A service worker keeps a copy of the app. It always tries the network first, so updates show up when you're online, and falls back to the saved copy when there's no signal.
- **Habits, names, emoji, why and statement words** are all managed on the **Habits** tab.
- **The Plan tab** has a habit picker (chips) above the ladder, because each habit has its own ladder and schedule. It also shows starting numbers ("—" while measuring), yearly pace and cost in hours for every habit.

## How the numbers work
- **Week:** Monday 8:00 AM to the next Monday 8:00 AM.
- **Block:** 4 *counted* weeks. Block 1 starts on the Monday chosen in Setup.
- **Skip limit:** 1 skip per block. Undoing a skip gives it back.
- **Skipped week:** it doesn't count toward any block, total, limit or average. The block it falls in runs one week longer, so every block still has exactly 4 counted weeks. Skipped weeks appear in History as "Skipped."
- **Starting number:** the total spent in block 1, kept separately for each category.
- **Limit percentage by block:** block 2 = 90%, block 3 = 80%, block 4 = 70%, block 5 = 60%, block 6 and after = 50%. It's the same for both categories.
- **Weekly limit:** (starting number ÷ 4) × the block's percentage.
- **Block target:** (starting number × the block's percentage). This is only used for the hit/miss line in the block-end message.
- **Missing a target changes nothing.** The next block drops anyway.
- **Purchases left:** dollars left this week ÷ that category's average purchase amount (all purchases logged so far), rounded down. Never below 0.

## What it does not do
- **No reading of screenshots or receipts.** You type the amount, or import a CSV/PDF statement file.
- **No connection to a bank or card.** No bank login, no syncing. A statement file you choose to open is read on the phone and nothing is uploaded or stored except the buys you choose to add.
- **No logins or accounts, and no cloud.** Data stays in the phone's browser.
- **No in-app sharing network.** No friends list, no partner accounts, no leaderboards. Accountability is only the text report you send yourself through the phone's share sheet.
- **No more than 5 habits, and never zero.** Renaming doesn't change history or limits. Deleting removes that habit's buys.
- **No per-habit skips.** A skipped week is skipped for every habit (1 per plan block).
- **No auto-categorizing beyond statement words.** No AI guessing. A line matches a habit only if it contains one of that habit's words.
- **No push notifications, reminders or alarms.** The resist countdown only shows inside the app.
- **No "danger time" or time-of-day patterns.** People often log a buy after the fact, so the logged time isn't reliable enough to find patterns in.
- **No silent auto-logging.** Quick-log and Apple Pay links only pre-fill. Nothing is saved without a tap.
- **No savings tracking it can't prove.** The goal jar counts only money the user marks as moved.
- **No auto-sending.** The accountability text only goes out when you tap Send and pick the person yourself.
- **No charts or graphs** beyond the progress rings on Home and the progress bars in History. No line charts, no trend graphs.
- **No editing a purchase.** Delete it and log it again.
- **No more than 1 skip per block.** Unused skips don't carry over to the next block.
- **No skipping a week after you've logged in it**, no skipping past or future weeks, and no skipping part of a week. Skip applies only to the current week, and only before the first purchase of that week.
- **No changing the start date, percentages or reset time** after setup.
- **No savings goals, money transfers or tips.**
- **No tracking of what or where you bought.** Just the category and the amount.
- **No cost.** It's free to build and run, and has no paid services.

## Where the information comes from
- **The person types in:**
  - the block 1 start date, once
  - the category, by tapping + Pizza or + Cash
  - the dollar amount
- **The app already knows:**
  - the date and time of each purchase, from the phone's clock
  - which week and block it is
  - the starting number, the weekly limits, the average purchase amount, and purchases left. It works all of these out from what's been logged.
- **Stored:** in the phone's browser storage only.
  - Every save is read back to confirm it landed, and the app asks the browser to protect it from automatic cleanup.
  - If the browser data gets cleared, the history is gone. The Download backup file is the protection against that, and it's also how you move the data to a new phone.
