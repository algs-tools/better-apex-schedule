---
description: Pull latest ALGS schedule data from Liquipedia and EA, update JSON data files
user_invocable: true
---

# Update Schedule

Pull the latest ALGS schedule data and update the JSON data files.

## Steps

1. **Fetch current schedule from Liquipedia** for each region:
   - Americas: `https://liquipedia.net/apexlegends/Apex_Legends_Global_Series/2026/Split_1/Pro_League/Americas`
   - EMEA: `https://liquipedia.net/apexlegends/Apex_Legends_Global_Series/2026/Split_1/Pro_League/EMEA`
   - APAC North: `https://liquipedia.net/apexlegends/Apex_Legends_Global_Series/2026/Split_1/Pro_League/APAC_North`
   - APAC South: `https://liquipedia.net/apexlegends/Apex_Legends_Global_Series/2026/Split_1/Pro_League/APAC_South`

2. **Extract updated data:**
   - Match dates and times (convert to UTC)
   - Match results and scores (for completed matches)
   - Team standings updates
   - Group assignments (if changed)

3. **Update JSON files:**
   - `data/schedule/split1-pro-league.json` - update match dates, times, status
   - `data/teams/*.json` - update group assignments if changed
   - Set `time_confirmed: true` for matches with confirmed start times
   - Set `status: "completed"` for finished matches

4. **Validate data integrity:**
   - All dates in ISO 8601 format (YYYY-MM-DD)
   - All times in UTC HH:MM format
   - All region values are one of: americas, emea, apac-north, apac-south
   - No duplicate match IDs

5. **Show summary** of changes made (new matches, updated times, completed results).

## Match ID Convention

Format: `{event}-{region_short}-r{round}-{groups}`

- Event: `s1pl` (Split 1 Pro League), `oo` (Online Opens), etc.
- Region short: `ams`, `emea`, `avn`, `avs`
- Groups: `ab`, `ac`, `bc`, `rf` (regional finals)

## Time Sources

If exact times aren't published, use estimated times from historical patterns:
- Americas: 00:00 UTC (4:00 PM PT)
- EMEA: 17:00 UTC (7:00 PM CET)
- APAC North: 09:00 UTC (6:00 PM JST)
- APAC South: 10:00 UTC (6:00 PM SGT)

Mark estimated times with `"time_confirmed": false`.
