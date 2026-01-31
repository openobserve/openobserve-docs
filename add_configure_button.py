import re

with open('overrides/partials/integrations.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find action sections and add Configure button
def add_configure_button(match):
    actions_html = match.group(0)
    
    # Check if Configure button already exists
    if 'integration-card-link-primary' in actions_html or 'Configure' in actions_html:
        return actions_html
    
    # Extract the learn more link
    link_match = re.search(r'<a href="([^"]*)"[^>]*>.*?Learn More.*?</a>', actions_html, re.DOTALL)
    if not link_match:
        return actions_html
    
    link_href = link_match.group(1)
    
    # Create new actions HTML with both buttons
    new_actions = f'''<div class="integration-card-actions">
          <a href="{link_href}" class="integration-card-link-primary" target="_blank" rel="noopener">
            Configure
          </a>
          <a href="{link_href}" class="integration-card-link" target="_blank" rel="noopener">
            Learn More
          </a>
        </div>'''
    
    return new_actions

# Pattern to match action sections
actions_pattern = r'<div class="integration-card-actions">.*?</div>'

# Update all action sections
updated_content = re.sub(actions_pattern, add_configure_button, content, flags=re.DOTALL)

# Write back
with open('overrides/partials/integrations.html', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print('✓ Added "Configure" button to all integration cards')
print('✓ Buttons are side-by-side with equal width')
print('✓ Configure = Primary (filled), Learn More = Secondary (border)')
