#!/usr/bin/env python3
"""Process a new ZiggySitters lead: save to Notion + notify on Telegram."""
import json
import subprocess
import sys
import urllib.request
from datetime import datetime

NOTION_DB_ID = "30be98c0-cb46-811a-9f77-f6b047c376b3"

def get_secret(service, key):
    return subprocess.check_output(
        ["security", "find-generic-password", "-s", service, "-a", key, "-w"]
    ).decode().strip()

def save_to_notion(lead):
    notion_key = get_secret("jaspion-notion", "NOTION_API_KEY")
    
    properties = {
        "Name": {"title": [{"text": {"content": lead.get("name", "Unknown")}}]},
        "Email": {"email": lead.get("email", "")},
        "Type": {"select": {"name": lead.get("type", "Sitter")}},
        "Status": {"select": {"name": "New"}},
        "Date": {"date": {"start": datetime.now().isoformat()[:10]}},
    }
    
    if lead.get("phone"):
        properties["Phone"] = {"phone_number": lead["phone"]}
    if lead.get("suburb"):
        properties["Suburb"] = {"select": {"name": lead["suburb"]}}
    if lead.get("source"):
        properties["Source"] = {"rich_text": [{"text": {"content": lead["source"]}}]}
    
    data = json.dumps({"parent": {"database_id": NOTION_DB_ID}, "properties": properties}).encode()
    
    req = urllib.request.Request(
        "https://api.notion.com/v1/pages",
        data=data,
        headers={
            "Authorization": f"Bearer {notion_key}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
        },
    )
    
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        return result.get("url", "saved")
    except Exception as e:
        print(f"Notion error: {e}")
        return None

def main():
    if len(sys.argv) < 3:
        print("Usage: process-lead.py <name> <email> [phone] [suburb] [type] [source]")
        sys.exit(1)
    
    lead = {
        "name": sys.argv[1],
        "email": sys.argv[2],
        "phone": sys.argv[3] if len(sys.argv) > 3 else "",
        "suburb": sys.argv[4] if len(sys.argv) > 4 else "",
        "type": sys.argv[5] if len(sys.argv) > 5 else "Sitter",
        "source": sys.argv[6] if len(sys.argv) > 6 else "website",
    }
    
    # Save to Notion
    url = save_to_notion(lead)
    if url:
        print(f"Saved to Notion: {url}")
    
    # Save to local JSON
    tracker_path = f"/Users/janainamdeoliveira/clawd/ziggysitters/leads/{'sitter' if lead['type'] == 'Sitter' else 'pet-owner'}-leads.json"
    try:
        with open(tracker_path) as f:
            tracker = json.load(f)
        lead["timestamp"] = datetime.now().isoformat()
        tracker["leads"].append(lead)
        with open(tracker_path, "w") as f:
            json.dump(tracker, f, indent=2)
    except Exception as e:
        print(f"Local save error: {e}")

if __name__ == "__main__":
    main()
