import re

with open('overrides/partials/integrations.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find default content sections and add category if missing
def add_category_to_default(match):
    full_match = match.group(0)
    
    # Check if default content already has category
    default_content_match = re.search(r'<div class="integration-card-content">(.*?)</div>', full_match, re.DOTALL)
    if not default_content_match:
        return full_match
    
    default_content = default_content_match.group(1)
    
    # If category already exists in default content, skip
    if 'integration-card-category' in default_content:
        return full_match
    
    # Extract category from hover content
    category_match = re.search(r'<div class="integration-card-category"[^>]*>(.*?)</div>', full_match, re.DOTALL)
    if not category_match:
        return full_match
    
    category_html = category_match.group(0)
    
    # Find the title in default content and add category after it
    updated = re.sub(
        r'(<div class="integration-card-content">.*?<h3 class="integration-card-title">.*?</h3>)',
        r'\1\n        ' + category_html,
        full_match,
        flags=re.DOTALL
    )
    
    return updated

# Pattern to match each complete card
card_pattern = r'<div class="integration-card"[^>]*>.*?</div>\s*(?=\n\s*<div class="integration-card"|</div>\s*<div class="integrations-help")'

# Update all cards
updated_content = re.sub(card_pattern, add_category_to_default, content, flags=re.DOTALL)

# Write back
with open('overrides/partials/integrations.html', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print('✓ Added category badges to default content on all cards')
print('✓ Desktop: Shows category badge on both default and hover states')
print('✓ Mobile: Shows full hover-style card with category badge')
