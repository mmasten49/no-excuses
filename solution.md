# The solution

## In one sentence
**No Excuses** is a phone web app where you log each pizza or cash purchase in a few taps, and it shows how many purchases you have left this week before you hit a limit that drops every 4 weeks, until you're spending half.

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

### 1. Setup (first open only)
- **Shows:** "When does block 1 start?" with a date picker that only allows Mondays.
- **Tap Start:** saves the date and goes to Home. This screen never shows again.

### 2. Home
- **Top line:** "Block 3 · Week 2 of 4 · Limit 80%". In block 1 it says "Block 1 · Week 2 of 4 · Measuring, no limits yet."
- **Block-end message:** shown once, on the first open after a block ends. Each category gets one line:
  - "Pizza: hit it."
  - "Cash: missed by $14."
  - The last line is "New limit: 80%." Tap **OK** to close it.
- **Two cards, Pizza and Cash.** Each one shows:
  - **Purchases left this week.** Example: "1 pizza trip left." This is the biggest text on the screen.
  - **Dollars left this week.** Example: "$18 of $54 left."
  - If you're over the limit, the card turns red and says "Over by $12."
  - In block 1, each card shows only "Spent this week: $X" and "Spent this block: $X."
- **Two big buttons: + Pizza and + Cash.** Tapping one opens Log Purchase for that category.
- **Small link: History.** Opens History.
- **Small link: Skip this week.** It's only shown if nothing has been logged yet this week **and** this block's one skip hasn't been used. Below it, in small text: "1 skip left this block" or "Skip used this block."
  - Tap it and a prompt appears: "Skip this week? Nothing gets tracked until Monday 8 AM, and this week won't count toward your block." The options are **Skip** and **Cancel**.
  - After Skip, the cards are replaced with "Skipped week, back Monday 8 AM," the + Pizza and + Cash buttons are hidden, and an **Undo skip** link appears. Undo is available until the week ends.

### 3. Log Purchase
- **Shows:** the category name and a number keypad for the dollar amount. Date and time are filled in automatically.
- **Before saving** (block 2 and later), a line under the amount says what happens: "After this: 0 trips left this week."
- **Tap Save:** saves the purchase and goes back to Home with the numbers updated.
- **Tap Cancel:** goes back to Home and saves nothing.

### 4. History
- **Shows:** this week's purchases, newest first, each with category, amount, and day/time. Below that: this block's total for each category next to the block's target.
- **Tap a purchase:** a "Delete?" prompt appears. This is how mistakes get fixed. There's no edit. Delete it and log it again.
- **Tap Back:** goes to Home.

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
- **No other categories.** Only Pizza and Cash. You can't add, rename or remove them.
- **No push notifications, reminders or alarms.**
- **No charts or graphs.** Numbers only.
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
- **Stored:** in the phone's browser storage only. If the browser data gets cleared, the history is gone. That's an accepted risk for an app this small.
