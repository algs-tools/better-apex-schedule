"""Flip `"status": "upcoming"` to `"completed"` for matches whose scheduled
end time is in the past. Preserves JSON formatting by editing in place via
regex instead of round-tripping through json.dumps."""

from __future__ import annotations

import re
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

MATCH_DURATION = timedelta(hours=3)
SCHEDULE_DIR = Path(__file__).resolve().parent.parent / "data" / "schedule"

MATCH_RE = re.compile(
    r'(\{\s*"id":[^{}]*?'
    r'"date":\s*"(?P<date>\d{4}-\d{2}-\d{2})",[^{}]*?'
    r'"time_utc":\s*"(?P<time>\d{2}:\d{2})",[^{}]*?'
    r'"status":\s*)"upcoming"',
    re.DOTALL,
)


def main() -> int:
    now = datetime.now(tz=UTC)
    total = 0
    for path in sorted(SCHEDULE_DIR.glob("*.json")):
        text = path.read_text()
        count = 0

        def replace(m: re.Match[str]) -> str:
            nonlocal count
            scheduled = datetime.fromisoformat(
                f"{m['date']}T{m['time']}:00+00:00"
            )
            if scheduled + MATCH_DURATION < now:
                count += 1
                return m.group(1) + '"completed"'
            return m.group(0)

        new_text = MATCH_RE.sub(replace, text)
        if count:
            path.write_text(new_text)
            print(f"{path.name}: flipped {count} match(es) to completed")
            total += count
    print(f"Total updated: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
