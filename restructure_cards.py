import re

# Read the current template
with open('overrides/partials/integrations.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match individual cards
card_pattern = r'<div class="integration-card"([^>]*)>(.*?)</div>\s*(?=<div class="integration-card"|</div>\s*<div class="integrations-help"|$)'

def restructure_card(match):
    attributes = match.group(1)
    card_content = match.group(2)
    
    # Extract components
    icon_match = re.search(r'(<div class="integration-card-icon">.*?</div>)', card_content, re.DOTALL)
    title_match = re.search(r'<h3 class="integration-card-title">(.*?)</h3>', card_content, re.DOTALL)
    category_match = re.search(r'(<div class="integration-card-category"[^>]*>.*?</div>)', card_content, re.DOTALL)
    desc_match = re.search(r'<p class="integration-card-description">(.*?)</p>', card_content, re.DOTALL)
    link_match = re.search(r'<a href="([^"]*)"[^>]*>(.*?)</a>', card_content, re.DOTALL)
    
    if not all([icon_match, title_match, link_match]):
        return match.group(0)  # Return original if parsing fails
    
    icon = icon_match.group(1)
    title = title_match.group(1).strip()
    category = category_match.group(1) if category_match else ''
    description = desc_match.group(1).strip() if desc_match else ''
    link_href = link_match.group(1)
    
    # Build new card structure
    new_card = f'''<div class="integration-card"{attributes}>
      {icon}
      
      <!-- Default content (centered, icon + title only) -->
      <div class="integration-card-content">
        <h3 class="integration-card-title">{title}</h3>
      </div>
      
      <!-- Hover content (full details) -->
      <div class="integration-card-hover-content">
        <h3 class="integration-card-title">{title}</h3>
        {category}
        <p class="integration-card-description">{description}</p>
        <div class="integration-card-actions">
          <a href="{link_href}" class="integration-card-link" target="_blank" rel="noopener">
            Learn More 
          </a>
        </div>
      </div>
    </div>'''
    
    return new_card

# Find the integrations grid section
grid_start = content.find('<div class="integrations-grid" id="integrationsGrid">')
grid_end = content.find('</div>\n\n      <div class="integrations-help">', grid_start)

if grid_start != -1 and grid_end != -1:
    grid_content = content[grid_start:grid_end]
    
    # Restructure all cards
    new_grid = re.sub(card_pattern, restructure_card, grid_content, flags=re.DOTALL)
    
    # Replace in original content
    new_content = content[:grid_start] + new_grid + content[grid_end:]
    
    # Write back
    with open('overrides/partials/integrations.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✓ Successfully restructured all integration cards")
    print("✓ Cards now have separate default and hover content containers")
else:
    print("✗ Could not find integrations grid section")
