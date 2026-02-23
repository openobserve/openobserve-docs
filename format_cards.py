import re

with open('overrides/partials/integrations.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add proper spacing between cards
content = re.sub(r'</div></div><div class="integration-card"', '</div></div>\n\n    <div class="integration-card"', content)

with open('overrides/partials/integrations.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✓ Formatted cards with proper spacing')
