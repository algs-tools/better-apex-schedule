---
description: Pull completed match results and update standings
user_invocable: true
---

# Update Results

Pull completed match results from Liquipedia and update the schedule data.

## Steps

1. **Identify completed matches** - find matches in schedule JSON files with `status: "upcoming"` where the date has passed.

2. **Fetch results from Liquipedia** for each completed match:
   - Match scores/placements
   - Kill points
   - Final standings

3. **Update match entries:**
   - Set `"status": "completed"`
   - Add results data if available:
     ```json
     {
       "status": "completed",
       "results": {
         "winner": "Team Name",
         "standings_url": "https://liquipedia.net/..."
       }
     }
     ```

4. **Update season.json** if event status has changed (e.g., event completed).

5. **Show summary** of updated results.

## Liquipedia URLs by Event

- Split 1 Pro League: `https://liquipedia.net/apexlegends/Apex_Legends_Global_Series/2026/Split_1/Pro_League/{Region}`
- Split 1 Playoffs: `https://liquipedia.net/apexlegends/Apex_Legends_Global_Series/2026/Split_1/Playoffs`
- Split 2 Pro League: `https://liquipedia.net/apexlegends/Apex_Legends_Global_Series/2026/Split_2/Pro_League/{Region}`
- Championship: `https://liquipedia.net/apexlegends/Apex_Legends_Global_Series/2026/Championship`

## Notes

- Only update matches where the date has passed
- Don't change `time_confirmed` status during results updates
- If Liquipedia doesn't have results yet, skip that match
- Regional Finals results may need manual entry
