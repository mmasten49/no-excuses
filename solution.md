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
- **Bottom tab bar:** **Home · History · Plan.** Tap any tab to switch. The current tab is red.
- **Saved pill** in the top right corner: "✓ Saved 4:40 PM," showing the time of the last save. It turns red and says "Not saving" if the browser refuses to store data. Tap it to jump to "Your data" on Plan.

### 1. Setup (first open only)
- **Step 1, Your two habits:** two name fields ("e.g. Pizza," "e.g. Coffee"), each with a row of 12 emoji to pick from. **Next** stays disabled until both names are filled in.
- **Step 2:** a **‹ Back** link, then a short 3-step explanation of the plan, then a list of 5 Mondays (this week's, plus the next 4). Next Monday is preselected.
- **Tap a Monday:** selects it.
- **Tap "Start the plan":** saves and goes to Home. This screen never shows again.

### 2. Home
- **Top:** "Block 3 · week 2 of 4" with a big "80% limit" (or "Measuring" in block 1), plus a "Resets in 3d 15h" countdown and a thin bar showing how far through the week you are.
- **Block-end message:** shown once, on the first open after a block ends. Each category shows **HIT IT** or **MISSED BY $14**, then "New limit: 80%." Tap **Let's go** to close it.
- **Two cards, Pizza and Cash.** Each one has a **progress ring** that fills as you spend toward the weekly limit. Inside the ring is the number of purchases left, which is the biggest text on the screen. Next to the ring:
  - **A headline:** "2 pizza trips left," "Last one this week," "Done for the week," or "Over by $12" (the card turns red when you're over).
  - **Dollars left:** "$18 of $54 left."
  - **In block 1:** the ring shows how far through the week you are, the center shows dollars spent this week, and the headline shows dollars spent this block.
- **Two stat tiles (block 2 and later):**
  - **🔥 Streak:** finished weeks in a row with both categories under the limit, plus your best streak.
  - **💰 Money kept:** how much less you've spent than your old pace (starting number ÷ 4 per week), added up over finished weeks. It's red if negative.
- **Two big buttons: + Pizza and + Cash.** Tapping one slides up the Log Purchase sheet.
- **Skip line:** "Break week? Skip this week · 1 skip left this block." It's only shown if nothing has been logged yet this week **and** this block's one skip hasn't been used. Below it, in small text: "1 skip left this block" or "Skip used this block."
  - Tap it and a prompt appears: "Skip this week? Nothing gets tracked until Monday 8 AM, and this week won't count toward your block." The options are **Skip** and **Cancel**.
  - After Skip, the cards are replaced with "Skipped week, back Monday 8 AM," the + Pizza and + Cash buttons are hidden, and an **Undo skip** link appears. Undo is available until the week ends.

### 3. Log Purchase (a sheet that slides up from the bottom)
- **Shows:** a Pizza / Cash switch, a big dollar amount, **3 quick-amount buttons** (your 3 most-used amounts for that category; until you have history, $15/$20/$25 for pizza and $20/$40/$60 for cash), and a number keypad. The date and time are filled in automatically.
- **Before saving**, a line under the amount says what happens: "After this: 0 pizza trips left this week" or "This puts you over by $6."
- **Tap Save $19:** saves, closes the sheet, and shows a checkmark confirmation ("Logged $19 · 1 pizza trip left this week"). The phone vibrates on phones that support it.
- **Tap Cancel or the dark area behind the sheet:** closes it and saves nothing.

### 4. History
- **Week navigator:** **‹ Back** and **Next ›** buttons on either side of the week title ("This week," "Last week," "Week of Nov 16"), with dates and block below. Swiping left or right also works. You can't go before week 1 or past this week. When you're viewing a past week, a **"Jump to this week"** button appears.
- **Week summary:** for each category, dollars spent against the limit with a progress bar, and **Under ✓**, **On track**, or **Over by $X**. Skipped weeks say so.
- **Purchases:** that week's purchases, newest first, each with category, amount, and day/time, plus a trash button. Tapping trash asks "Delete this?" first. There's no edit. Delete it and log it again.

### 5. Plan
- **The ladder:** blocks 1–6 (more if you're past 6), each with its percentage, its weekly limit for each category, and a status: **NOW**, **DONE**, or a ✓/✗ for each category in finished blocks. It also notes when a block's skip was used.
- **Starting numbers:** the block-1 total for each category (marked "so far" during block 1), plus your best streak and money kept.
- **Your data:**
  - **Saved on this phone:** the last save time.
  - **How many purchases are stored.**
  - **Whether the browser has agreed to protect the data from automatic cleanup.**
  - **A plain-English explanation of what survives:** closing the app and restarting the phone. What doesn't: clearing browser data or switching browsers.
  - **Download backup:** saves a `.json` file with everything to the phone's Files.
  - **Restore from backup:** pick that file, see what it contains, confirm, and it replaces what's on the phone. A file that isn't a valid backup is rejected and nothing changes.

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
- **No reading of screenshots or receipts.** You type the amount.
- **No connection to a bank or card.** It never sees your accounts.
- **No logins or accounts, and no cloud.** Data stays in the phone's browser.
- **No sharing** with friends or family, and no accountability partners.
- **Exactly two habits.** You can't add a third or remove one. You *can* rename them and change their emoji in Plan › Rename habits, and history and limits stay the same.
- **No push notifications, reminders or alarms.**
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
