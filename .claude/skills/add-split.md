---
description: Add a new split's schedule data (e.g., Split 2 Pro League)
user_invocable: true
---

# Add Split

Create schedule data for a new ALGS split or event.

## Usage

```
/add-split
```

The skill will ask for:
1. **Event ID** (e.g., `split2-pro-league`, `split2-playoffs`)
2. **Regions** to include

## Steps

1. **Determine the event** - ask the user which event to add data for:
   - `split2-pro-league` - Split 2 Pro League
   - `split2-playoffs` - Split 2 Playoffs
   - `last-chance-qualifier` - Last Chance Qualifier
   - `championship` - ALGS Championship

2. **Scrape Liquipedia** for the event's data:
   - Team rosters and group assignments
   - Schedule dates
   - Format details

3. **Create schedule JSON file** at `data/schedule/{event-id}.json` using the same schema:
   ```json
   {
     "event": "event-id",
     "event_name": "Event Name",
     "format": "Format description",
     "start_date": "YYYY-MM-DD",
     "end_date": "YYYY-MM-DD",
     "matches": [...]
   }
   ```

4. **Update team files** if new teams qualified:
   - Check each region's team file in `data/teams/`
   - Add new teams, update group assignments
   - Note seed changes (invited vs qualifier)

5. **Update index.html** if needed:
   - Add the new schedule JSON to the `loadData()` fetch list in `js/app.js`
   - The event filter buttons are already present for planned events

6. **Validate** all JSON files parse correctly and match IDs are unique.

## File Naming Convention

Schedule files: `data/schedule/{event-id}.json`
- `split1-pro-league.json`
- `split2-pro-league.json`
- `split1-playoffs.json`
- `split2-playoffs.json`
- `last-chance-qualifier.json`
- `championship.json`
