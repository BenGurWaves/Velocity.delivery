# Velocity Prospect Auto-Pipeline Skill - TODO

Current Status: Plan approved. Implementing /prospect-auto CLI skill per spec.

## Steps (Sequential)

### 1. Read existing pipeline files for integration
- [ ] `read_file ~/velocity-delivery/pipeline/cli.py`
- [ ] `read_file ~/velocity-delivery/pyproject.toml`

### 2. Create prospect_auto.py
- [ ] `create_file ~/velocity-delivery/pipeline/prospect_auto.py` - Full agent script (6 phases, adapted to tools/curl/playwright exec).

### 3. Edit CLI for /prospect-auto command
- [ ] `edit_file ~/velocity-delivery/pipeline/cli.py` - Add subparser 'prospect-auto [INFO]'

### 4. Add deps
- [ ] `execute_command cd ~/velocity-delivery && pip install beautifulsoup4 lxml python-whois playwright`

### 5. Install Playwright browsers
- [ ] `execute_command cd ~/velocity-delivery && playwright install chromium`

### 6. Test with dummy prospect
- [ ] Run: `cd ~/velocity-delivery && python pipeline/cli.py prospect-auto "Test Corp, test.com"`

### 7. Update TODO & attempt_completion

Progress: 0/7 complete.

