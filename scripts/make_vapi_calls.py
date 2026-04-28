import sys
import os
import re
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table

# Add project root to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from utils.vapi import VapiClient

# Load environment variables
load_dotenv()

console = Console()

# Path to the call list
CALL_LIST_PATH = Path("call-list-day2.md")

def parse_call_list(file_path: Path):
    """Parse the markdown file to extract business names and phone numbers."""
    content = file_path.read_text(encoding="utf-8")
    
    # Regex to find: 1. Name — (XXX) XXX-XXXX — Description
    # Matches numbering, name, and phone number
    pattern = r"^\d+\.\s+(.*?)\s+—\s+(\(\d{3}\)\s+\d{3}-\d{4})"
    
    leads = []
    for line in content.splitlines():
        match = re.search(pattern, line)
        if match:
            name = match.group(1).strip()
            phone = match.group(2).strip()
            
            # Convert (916) 299-9939 to +19162999939
            clean_phone = "+1" + re.sub(r"\D", "", phone)
            
            leads.append({
                "name": name,
                "phone": clean_phone,
                "display_phone": phone
            })
            
    return leads

async def main():
    if not os.getenv("VAPI_API_KEY"):
        console.print("[red]VAPI_API_KEY must be set in .env[/]")
        return

    if not CALL_LIST_PATH.exists():
        console.print(f"[red]Call list file not found: {CALL_LIST_PATH}[/]")
        return

    leads = parse_call_list(CALL_LIST_PATH)
    
    if not leads:
        console.print("[yellow]No leads with valid phone numbers found in call list.[/]")
        return

    # Show summary table
    table = Table(title="Vapi Outbound Call Queue")
    table.add_column("Business Name", style="cyan")
    table.add_column("Phone Number", style="green")
    table.add_column("Status", style="bold")

    for lead in leads:
        table.add_row(lead["name"], lead["display_phone"], "Pending")
    
    console.print(table)
    
    confirm = input("\nReady to initiate these calls? (y/n): ")
    if confirm.lower() != 'y':
        console.print("[yellow]Operation cancelled.[/]")
        return

    vapi = VapiClient()
    
    for lead in leads:
        console.print(f"\n[bold blue]Calling {lead['name']} ({lead['phone']})...[/]")
        try:
            result = await vapi.make_call(phone_number=lead["phone"], name=lead["name"])
            if result:
                call_id = result.get("id")
                console.print(f"[green]Call initiated! ID: {call_id}[/]")
        except Exception as e:
            console.print(f"[red]Failed to call {lead['name']}: {str(e)}[/]")
            
        # Add a small delay between initiating calls
        await asyncio.sleep(1)

    console.print("\n[bold green]All calls processed![/]")

if __name__ == "__main__":
    asyncio.run(main())
