# OpenObserve Integrations Landing Page

This directory contains the implementation of the integrations landing page for OpenObserve documentation.

## Overview

The integrations landing page provides a filterable, searchable interface for browsing all available OpenObserve integrations, similar to the Datadog integrations page.

## Features

- ✅ **Category Filtering**: Filter integrations by category (Cloud, Database, Messaging, OS, Server, DevOps)
- ✅ **Search Functionality**: Real-time search across integration names and descriptions
- ✅ **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- ✅ **Hover Effects**: Desktop users see detailed info on hover; mobile users see all info by default
- ✅ **Dynamic Loading**: Integrations loaded from `integrations.json` for easy maintenance
- ✅ **Analytics Tracking**: Microsoft Clarity and Google Analytics integration
- ✅ **Accessible**: Keyboard navigation and screen reader friendly

## File Structure

```
docs/
├── integration/
│   └── index.md                          # Integrations landing page (uses custom template)
├── assets/
│   └── integration-icons/                # Integration icons
│       ├── README.md                     # Icon documentation
│       ├── DOWNLOAD_GUIDE.md            # Manual download instructions
│       ├── cloud.svg                     # Category fallback icons
│       ├── database.svg
│       ├── messaging.svg
│       ├── os.svg
│       ├── server.svg
│       └── devops.svg
├── stylesheets/
│   └── integrations-page.css            # Page-specific styles
├── js/
│   └── integrations.js                   # Page functionality
overrides/
└── partials/
    └── integrations.html                 # Custom page template
integrations.json                          # Integration data source
```

## How It Works

### 1. Data Source (`integrations.json`)

All integration data is stored in a single JSON file at the root of the project:

```json
[
  {
    "id": "kubernetes",
    "name": "Kubernetes",
    "description": "Monitor Kubernetes clusters and workloads",
    "category": "cloud",
    "icon": "",
    "configureUrl": "/docs/integration/k8s/",
    "learnMoreUrl": "/docs/integration/k8s/"
  }
]
```

**Fields:**
- `id`: Unique identifier (used for icon filenames and tracking)
- `name`: Display name
- `description`: Short description (shown on cards)
- `category`: Category for filtering (cloud, database, messaging, os, server, devops)
- `icon`: Optional custom icon path (falls back to `/docs/assets/integration-icons/{id}.svg`)
- `configureUrl`: Link to configuration documentation
- `learnMoreUrl`: Link to detailed documentation

### 2. Template (`overrides/partials/integrations.html`)

Custom Jinja2 template that extends the base Material theme. Provides:
- Page structure with header, filters, search, and grid
- Placeholder elements for dynamic content
- Mobile-responsive layout

### 3. Styles (`docs/stylesheets/integrations-page.css`)

Custom CSS for the integrations page:
- Grid layout with responsive breakpoints
- Card hover effects (desktop only)
- Category tag styling with dynamic colors
- Search bar styling
- Mobile optimizations

### 4. JavaScript (`docs/js/integrations.js`)

Handles all dynamic functionality:
- Loads integration data from `integrations.json`
- Renders integration cards dynamically
- Implements category filtering
- Implements search functionality
- Tracks user interactions
- Manages mobile vs desktop behavior

## Adding New Integrations

To add a new integration:

1. **Add entry to `integrations.json`:**
   ```json
   {
     "id": "my-integration",
     "name": "My Integration",
     "description": "Brief description",
     "category": "database",
     "icon": "",
     "configureUrl": "/docs/integration/my-integration/",
     "learnMoreUrl": "/docs/integration/my-integration/"
   }
   ```

2. **Add icon (optional but recommended):**
   - Save icon as `/docs/assets/integration-icons/my-integration.svg`
   - Or provide custom path in `icon` field
   - If no icon provided, falls back to first letter placeholder

3. **Create documentation:**
   - Add documentation page at the `configureUrl` and `learnMoreUrl` paths
   - Update navigation in `.pages` files if needed

The integration will automatically appear on the landing page!

## Customization

### Adding New Categories

1. Update the category filter buttons in `integrations.html`
2. Add category color in `integrations.js` (categoryColors object)
3. Create category fallback icon in `/docs/assets/integration-icons/`

### Styling

Colors and spacing can be adjusted in `integrations-page.css`:
- Uses CSS custom properties for theming
- Automatically adapts to light/dark mode
- Responsive breakpoints at 768px and 1024px

### Analytics

The page tracks:
- Category filter selections
- Search queries
- Card clicks
- Action button clicks (Configure/Learn More)

Events are sent to both Microsoft Clarity and Google Analytics if configured.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ with polyfills
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- JSON file is cached by browser
- Cards rendered efficiently with template strings
- Debounced search (300ms)
- No external dependencies beyond MkDocs Material theme

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels where appropriate
- Color contrast compliant
- Screen reader friendly

## Future Enhancements

Potential improvements:
- [ ] Add sorting options (alphabetical, most popular)
- [ ] Lazy load icons for better performance
- [ ] Add "Featured" integrations section
- [ ] Implement URL-based filtering (deep linking)
- [ ] Add integration status badges (Beta, New, etc.)
- [ ] Multi-select category filtering

## Troubleshooting

**Icons not showing:**
- Check that icon file exists at expected path
- Verify icon filename matches integration ID
- Fallback letter icon should appear if image fails

**Filtering not working:**
- Check browser console for JavaScript errors
- Verify `integrations.json` is loading correctly
- Clear browser cache

**Styling issues:**
- Verify CSS file is included in `mkdocs.yml`
- Check for CSS conflicts with custom theme styles
- Test in both light and dark modes

## License

Same as OpenObserve project.
