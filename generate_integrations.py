#!/usr/bin/env python3
"""Generate SEO-friendly static HTML for integrations from JSON"""

import json
import os

# Read integrations JSON
with open('docs/integrations.json', 'r') as f:
    integrations = json.load(f)

# Generate static HTML for all integrations
html_parts = []

for integration in integrations:
    icon_path = f"/docs/assets/integration-icons/{integration['id']}.svg"
    category = integration['category']
    
    # Map categories to colors
    category_colors = {
        'cloud': '#3b82f6',
        'database': '#10b981',
        'messaging': '#f59e42',
        'os': '#8b5cf6',
        'server': '#ef4444',
        'devops': '#06b6d4'
    }
    
    color = category_colors.get(category, '#6b7280')
    
    card_html = f'''
    <div class="integration-card" data-integration-id="{integration['id']}" data-category="{category}">
      <div class="integration-card-icon">
        <img src="{icon_path}" alt="{integration['name']} icon" onerror="this.src='/docs/assets/integration-icons/{category}.svg'" loading="lazy">
      </div>
      <div class="integration-card-content">
        <h3 class="integration-card-title">{integration['name']}</h3>
        <div class="integration-card-category" style="background-color: {color}1a; color: {color};">
          {category.upper()}
        </div>
        <p class="integration-card-description">{integration['description']}</p>
      </div>
      <div class="integration-card-actions">
        <a href="{integration['learnMoreUrl']}" class="integration-card-link" target="_blank" rel="noopener">
          Learn More →
        </a>
      </div>
    </div>'''
    
    html_parts.append(card_html)

# Write to output file
output_html = '\n'.join(html_parts)

print(f"Generated {len(integrations)} integration cards")
print("\nCopy the output to docs/integration/index.md")
print("=" * 50)
print(output_html)
