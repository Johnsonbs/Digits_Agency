# Digit's Agency — Story Bible

Each theme is its own 12-case season with a serialized arc: solving one case
unlocks the data, the question, or the lead that the next case needs. No
worksheet stands alone, and no two themes reuse a scenario, cast, or dataset.

## Revision note (v2)

The first draft of this bible gave all four seasons the *exact* same skill
order, case by case — Entry@1, Cleaning@2, Total@3, Grand Total@4, COUNTIF@5,
IF@6, AVERAGE@7, FIND@8... every season, every time. That's a real problem:
played back to back (or even just one season straight through), it would feel
like the same worksheet wearing four costumes.

This revision keeps the same **skill pool** per season — kids do need
repeated reps with SUM/COUNTIF/IF to actually learn them — but:

- **Order varies by theme.** Sales meets FIND in Case 4; Health doesn't meet
  it until Case 5; Habit meets it in Case 3. No two seasons share a sequence.
- **Not every case visits every phase.** The engine has four tools (Entry,
  Cleaning, Analysis, Interpretation) but a case only uses the ones its story
  needs — see the **Shape** column below.
- **DIVIDE and COUNT join the pool.** Both already exist in the block engine
  (DIVIDE shipped with the Builder Tool) but hadn't been used in any case
  plan yet — real waste, given they're sitting right there.
- **Combo cases exist.** A handful of cases pair two skills in one sitting
  instead of introducing exactly one, which also breaks the metronome feel.

**Shape legend** (used in every table below):

| Shape | Meaning |
|---|---|
| Full | Entry → Cleaning → Analysis → Interpretation, as built today |
| Skip Cleaning | Data's already tidy — straight from Entry into Analysis |
| Skip Entry | Opens on a pre-loaded dataset (found evidence, an imported log) |
| Entry Only | A short, light case — just get the numbers in, minimal analysis |
| Cleaning Only | The whole case *is* the cleaning puzzle — analysis is trivial or skipped |
| Combo | Two skills asked for in the same formula/case instead of one |

### Status: Case 1 is built, and it's a bundle

Each theme's Case 1 (`src/data/cases/*Case.js`) is live today, but it's not
"just Data Entry" the way v1 of this bible described — it's a **tutorial
bundle** covering Entry, Cleaning, Total (×), Grand Total (SUM), and a
COUNTIF-based Summary all in one sitting, so a brand-new player gets the full
toolkit demonstrated once before the season fans out. The tables below treat
Case 1 as that bundle and redesign Cases 2–12 around it. Cases 2–12 are
**not yet built** — this is the plan, not shipped content.

---

## 🕵️ Detective — "The Office Jar Mystery"

**Premise:** Something has been going missing from Agency HQ all season —
snacks, then supplies, then something bigger. The player is the junior data
detective building the case file, one dataset at a time, until one suspect's
numbers stop adding up.

**Recurring cast:** Priya (barista), Marcus (mailroom), Denise (accounting),
Oscar (janitor) — four people with breakroom access. **Culprit: Marcus.**

| # | Case Title | Problem | Connects to Previous | Skill | Shape |
|---|---|---|---|---|---|
| 1 | The Vanishing Jar | The office candy jar keeps coming up short, and four coworkers had access. | Season opener — establishes the 4 suspects and the shop-style jar-spend log. | Entry, Cleaning, Total, Grand Total, COUNTIF | Full (built) |
| 2 | Who Swiped In? | A keycard log for the supply closet, already neatly kept — count how many times each suspect badged in. | New location, same 4 suspects — first physical-access clue of the season. | COUNT | Skip Cleaning |
| 3 | Frequent or Fine? | Label each suspect "Frequent" or "Fine" based on their swipe count. | Turns Case 2's raw counts into the season's first real verdicts. | IF + comparisons | Skip Cleaning |
| 4 | Follow the Money | A messy petty-cash log — clean it, then calculate what each suspect actually spent. | Attaches real numbers to the narrowed suspect list from Case 3. | Cleaning + Total (×) | Full |
| 5 | Early Bird | Average each suspect's daily check-in time to see who's alone in the building first. | Narrows the field using opportunity, not just access. | AVERAGE | Skip Cleaning |
| 6 | The Alibi Check | A "seen elsewhere" witness log — look up whether the lead suspect's name appears in it. | Tests whether Case 5's early-bird suspect actually has an alibi. | FIND | Skip Entry |
| 7 | Split Two Ways | A shared supply-closet bill was split between two suspects — divide it fairly and flag who under-paid. | Introduces a new angle on the Case 4 spending thread. | DIVIDE + IF | Combo |
| 8 | The Pattern in the Purchases | A city-wide receipt log — count how many of the lead suspect's purchases are unusually large. | A second, unrelated dataset lines up with the Case 4 spending pattern. | COUNTIF (deepened) | Skip Entry |
| 9 | The Doctored Report | An expense report where the numbers were quietly changed — recalculate the real totals. | Recomputing Case 4's math on altered numbers exposes real deception. | Grand Total (SUM) | Skip Entry |
| 10 | The Confession Slip | A short handwritten note found in evidence — just get the numbers in. | A breather beat right before the finale stretch. | Entry | Entry Only |
| 11 | Cornered | Combine swipe count, alibi result, purchase pattern, and the doctored report into one Guilt Score. | Aggregates Cases 2, 6, 8, and 9 into a single accusation. | IF (combined) | Skip Entry |
| 12 | Case Closed | Review the full timeline and confirm the culprit with the complete evidence trail. | Resolves the season — the name flagged back in Case 3/5 is confirmed for good. | Finale (AVERAGE, COUNTIF, IF reused) | Skip Entry |

---

## 🛒 Sales — "Digit's Corner Store"

**Premise:** The player opens one tiny corner store and grows it, decision by
decision, into a two-location mini business by season's end.

**Recurring cast/setting:** Digit's Corner Store, a starting inventory, a
rival shop down the street, and — by Case 9 — the store's first hires.

| # | Case Title | Problem | Connects to Previous | Skill | Shape |
|---|---|---|---|---|---|
| 1 | Open for Business | Enter the day's inventory and sales, clean the register log, and see what's popular. | Season opener — the starting inventory the whole store grows from. | Entry, Cleaning, Total, Grand Total, COUNTIF | Full (built) |
| 2 | Till Count | Today's register is already tidy — just total up the cash in the drawer. | Day 2, a quick benchmark right after Case 1's opening day. | Grand Total (SUM) | Skip Cleaning |
| 3 | Best Sellers | Average the price of the top-selling items to see if they're priced right. | Builds on Case 1/2's sales pattern. | AVERAGE | Skip Entry |
| 4 | The Rival Shop | Look up whether the competitor down the street stocks a specific item. | Prompted directly by seeing what's popular in Case 3. | FIND | Skip Entry |
| 5 | Split the Register | The till gets divided between morning and afternoon shifts — split it and flag any imbalance. | The store's now busy enough to need two shifts — a growth marker. | DIVIDE + IF | Combo |
| 6 | The Restock List | A messy supplier list needs cleaning before ordering more of what's selling. | Acts directly on what Case 3/4 revealed. | Cleaning + Total (×) | Full |
| 7 | Rainy Day Sales | A short, quiet sales day — just enter the numbers. | A seasonal breather beat. | Entry | Entry Only |
| 8 | The Discount Test | Apply a discount to slow-selling items and compare before/after totals. | Directly tests what to do about items *not* flagged Popular in Case 1. | MULTIPLY (reused) + IF | Combo |
| 9 | Payroll Day | Calculate total hours and pay for the store's new hires. | Selling well enough (Cases 1–8) is what makes hiring possible. | Grand Total (SUM) + AVERAGE | Skip Entry |
| 10 | Two Weeks Compared | Count how many days beat last week's best day, across the combined two-week log. | A growth-trend check spanning Cases 1–9's data. | COUNTIF (deepened) | Skip Entry |
| 11 | Profit or Loss? | Compare revenue against payroll and supply costs for a Profit/Loss verdict. | Combines the revenue thread (Case 2) with the cost threads (Case 6, 9). | DIVIDE + IF (combined) | Skip Entry |
| 12 | Grand Opening #2 | Compare two locations' performance to decide where to open store #2. | The profit proven in Case 11 is exactly what funds this expansion. | Finale (AVERAGE, COUNTIF, IF reused) | Full |

---

## 💪 Health — "Countdown to the Riverside 5K"

**Premise:** The player coaches an athlete, Jamie, through a training season
building toward one named race day: the Riverside 5K.

**Recurring cast/setting:** Jamie (the runner), a weekly training log, and a
season-long pace goal that gets tested at the finish line.

| # | Case Title | Problem | Connects to Previous | Skill | Shape |
|---|---|---|---|---|---|
| 1 | Lace Up | Enter Week 1's training log, clean it up, and see which days paid off. | Season opener — the baseline training log for the whole season. | Entry, Cleaning, Total, Grand Total, COUNTIF | Full (built) |
| 2 | Rest Day Ratio | Divide rest days by training days to check Jamie isn't overtraining. | A Week 1 wrap-up question, using the clean Case 1 log. | DIVIDE | Skip Cleaning |
| 3 | Best Pace Yet | Average pace across sessions to set a real improvement baseline. | Builds on Case 1's pace data. | AVERAGE | Skip Entry |
| 4 | The Group Run | A messy multi-runner log (a training partner joins) needs cleaning before counting who showed up. | Jordan joins Jamie's training — a new dataset, a new person. | Cleaning + COUNT | Full |
| 5 | Find the Race | Search a race calendar to confirm the Riverside 5K's date. | The pace hit so far (Case 3) is what makes locking in the goal race meaningful. | FIND | Entry Only |
| 6 | Fuel Check | A short nutrition log — just enter the numbers. | A prep beat once the race is locked in. | Entry | Entry Only |
| 7 | On Track, Two Weeks In | Count how many days beat the distance goal across the combined two-week log. | A bigger checkpoint using Cases 1 and 4's combined data. | COUNTIF (deepened) | Skip Entry |
| 8 | Interval Math | Divide each interval's distance by its time, and flag any interval under goal pace. | Training intensifies after the Case 7 checkpoint. | DIVIDE + IF | Combo |
| 9 | Recovery Heart Rate | Average heart-rate recovery from a pre-loaded watch export. | Monitors overtraining risk flagged back in Case 2. | AVERAGE | Skip Entry |
| 10 | The Long Run | Add up the taper-week's distance and check it's ready for race day. | Builds directly toward the race date locked in during Case 5. | Grand Total (SUM) + IF | Skip Entry |
| 11 | Race Ready? | Combine average pace, on-track days, and the long-run result into one Race Ready verdict. | Synthesizes Cases 3, 7, and 10 into a single go/no-go call. | IF (combined) | Skip Entry |
| 12 | Riverside 5K Day | Compute finish time and average split, and compare to the season's pace goal. | The finale — the named event from Case 5, judged against the goal set in Case 3. | Finale (SUM, AVERAGE, IF reused) | Full |

---

## ✅ Habit — "30 Days of Reading"

**Premise:** The player builds one personal habit — reading 20 minutes a
day — over 30 days, with the streak compounding week over week until Day 30.

**Recurring thread:** a single reading tracker that runs the entire season;
every case reopens and extends the same streak.

| # | Case Title | Problem | Connects to Previous | Skill | Shape |
|---|---|---|---|---|---|
| 1 | Start the Streak | Enter the first days' reading log, clean it up, and check the early streak. | Season opener — the tracker that runs for all 30 days. | Entry, Cleaning, Total, Grand Total, COUNTIF | Full (built) |
| 2 | Same Time Tomorrow | Average minutes per day to see if the habit is already growing. | A Week 1 reflection on the clean Case 1 log. | AVERAGE | Skip Cleaning |
| 3 | Pick the Next Book | Look up whether a requested book is on the shelf before Week 2 starts. | Solves a real obstacle (running out of books) that could break the streak. | FIND | Entry Only |
| 4 | Longest Streak Yet | A messy multi-week log needs cleaning before counting the longest goal-met run. | Merges three weeks of logs into one streak count. | Cleaning + COUNTIF (deepened) | Full |
| 5 | Pages Per Minute | Divide pages by minutes to find a new reading-speed metric. | A fresh angle on the same tracker, once there's enough data to compare. | DIVIDE | Skip Entry |
| 6 | Reading Buddies | A friend's short reading log — just enter the numbers, then count who hit the goal. | A social beat — the streak isn't just a solo effort anymore. | Entry + COUNT | Entry Only |
| 7 | Which Book Wins? | Total and average minutes spent per book to crown a season favorite. | Uses the merged Case 4 log to settle a fun debate. | Grand Total (SUM) + AVERAGE | Skip Entry |
| 8 | Halfway Bonus | Divide total minutes so far by days so far, times 30, to project the finish. | Checks whether the current pace (Case 2, 7) will reach the 30-day goal. | DIVIDE (reused) | Skip Entry |
| 9 | Weekend vs. Weekday | Compare weekend and weekday minutes with COUNTIF to spot a pattern. | A fresh cut on the same streak data. | COUNTIF + IF | Combo |
| 10 | The Slump | A rough week's messy log — clean it, then honestly label the Try Again days. | A realistic dip before the finale; no punishment, just an honest look. | Cleaning + IF | Full |
| 11 | Final Stretch | Combine streak length, average minutes, and goal-met ratio into one "On Pace for 30" verdict. | Synthesizes Cases 2, 4, and 8 into a single go/no-go call for the last week. | IF (combined) | Skip Entry |
| 12 | Day 30: Goal Achieved! | Compute the full month's Grand Total and average, confirming the complete 30-day streak. | The finale — every prior case's streak math compounds into this celebration. | Finale (SUM, AVERAGE, COUNTIF, IF reused) | Full |

---

### Engine implications for whenever Cases 2–12 get built

- **Skip Cleaning / Skip Entry** cases mean `MissionScreen`'s phase list
  (and `ProgressIndicator`) need to support a shorter step list per case,
  not always all four. The Brief screen is the natural place to show which
  steps a given case actually has.
- **Entry Only / Cleaning Only** cases mean `AnalysisStep`/`Interpretation`
  need to become optional per case, not just skippable in content but
  skippable in the *flow* — the "Continue" button at the end of Entry or
  Cleaning should be able to go straight to Complete.
- **Combo** cases don't need new engine work — they just ask for a formula
  that uses two block types (e.g. DIVIDE then IF) in the one target cell,
  which the existing formula engine already supports.
- **DIVIDE** is already shipped (`formulaEngine.js`, Math category).
  **COUNT** exists in the engine but has never been required by a case's
  correctness check — Cases 2 (Detective), 4 (Health), and 6 (Habit) above
  are the first to actually need it.
