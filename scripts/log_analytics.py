#!/usr/bin/env python3
"""Append daily Cloudflare Web Analytics (RUM) traffic to analytics-history.csv.

Free-tier Cloudflare retains only ~30 days; this captures it forward into a
CSV we own, so history accumulates indefinitely. Each run re-pulls the last
30 days (daily-grouped) and merges by date (freshest value wins), so any
missed days self-heal as long as it runs at least monthly.

Env:
  CF_TOKEN      Cloudflare API token (Account Analytics: Read)
  CF_ACCOUNT    Cloudflare account id
Writes: analytics-history.csv  (columns: date,visits,pageviews)  — account-wide.
"""
import os, sys, json, csv, datetime, urllib.request

TOKEN = os.environ["CF_TOKEN"].strip()
ACCT = os.environ["CF_ACCOUNT"].strip()
PATH = "analytics-history.csv"

until = datetime.date.today()
since = until - datetime.timedelta(days=30)

query = ("query($a:String!,$s:Date!,$u:Date!){viewer{accounts(filter:{accountTag:$a}){"
         "rumPageloadEventsAdaptiveGroups(limit:1000,filter:{date_geq:$s,date_leq:$u},"
         "orderBy:[date_ASC]){dimensions{date} count sum{visits}}}}}")
body = json.dumps({"query": query, "variables": {"a": ACCT, "s": since.isoformat(), "u": until.isoformat()}}).encode()

req = urllib.request.Request("https://api.cloudflare.com/client/v4/graphql", data=body,
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"})
resp = json.load(urllib.request.urlopen(req, timeout=30))
if resp.get("errors"):
    sys.exit("GraphQL errors: %s" % resp["errors"])

groups = resp["data"]["viewer"]["accounts"][0]["rumPageloadEventsAdaptiveGroups"]
fresh = {g["dimensions"]["date"]: (int(g["sum"]["visits"]), int(g["count"])) for g in groups}

rows = {}
if os.path.exists(PATH):
    with open(PATH) as f:
        for r in csv.DictReader(f):
            rows[r["date"]] = (int(r["visits"]), int(r["pageviews"]))
rows.update(fresh)  # freshest wins

with open(PATH, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["date", "visits", "pageviews"])
    for d in sorted(rows):
        w.writerow([d, rows[d][0], rows[d][1]])

print("analytics-history.csv: %d dates total (%d refreshed this run)" % (len(rows), len(fresh)))
