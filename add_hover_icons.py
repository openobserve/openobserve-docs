import re

with open('overrides/partials/integrations.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find hover content sections and add small icon
def add_hover_icon(match):
    full_match = match.group(0)
    
    # Extract the icon src from the main icon
    icon_src_match = re.search(r'<img src="([^"]*)"', full_match)
    if not icon_src_match:
        return full_match
    
    icon_src = icon_src_match.group(1)
    
    # Check if hover icon already exists
    if 'integration-card-hover-icon' in full_match:
        return full_match
    
    # Find the hover content section and add small icon after the opening div
    hover_content_pattern = r'(<div class="integration-card-hover-content">)'
    
    hover_icon_html = f'''\\1
        <div class="integration-card-hover-icon">
          <img src="{icon_src}" alt="" loading="lazy">
        </div>'''
    
    updated = re.sub(hover_content_pattern, hover_icon_html, full_match)
    return updated

# Pattern to match each complete card
card_pattern = r'<div class="integration-card"[^>]*>.*?</div>\s*(?=\n\s*<div class="integration-card"|</div>\s*<div class="integrations-help")'

# Update all cards
updated_content = re.sub(card_pattern, add_hover_icon, content, flags=re.DOTALL)

# Write back
with open('overrides/partials/integrations.html', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print('✓ Added small icons to all hover states')
print('✓ Icons will appear at top-left of hover content')
