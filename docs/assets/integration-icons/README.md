# Integration Icons

This directory contains 78 SVG icons for all 71 integrations displayed on the integrations landing page.

## Icon Sources

### From Datadog (68 icons)

Most icons were downloaded from Datadog's static image library:

```
https://static.datadoghq.com/static/images/logos/{icon-name}_avatar.svg
```

### Custom Icons (3 icons)

Created custom SVG icons for services not available in Datadog:

- `vector.svg` - Vector data pipeline
- `otel-collector.svg` - OpenTelemetry Collector
- `telegraf.svg` - Telegraf metrics collector

### Category Fallback Icons (7 icons)

Generic category icons for fallback purposes:

- `cloud.svg` - For cloud platforms
- `database.svg` - For database integrations
- `devops.svg` - For DevOps tools
- `messaging.svg` - For message brokers
- `os.svg` - For operating systems
- `server.svg` - For web servers
- `gcp.svg` - For Google Cloud Platform

## Download Scripts

PowerShell scripts used to download these icons (in repository root):

1. `download-all-integration-icons.ps1` - Main download script
2. `download-failed-icons.ps1` - Retry with alternative names
3. `download-final-icons.ps1` - Final attempt

## Naming Convention

Icons are named using the integration ID from integrations.json:

- Format: `{integration-id}.svg`
- Example: `kubernetes.svg`, `postgresql.svg`, `kafka.svg`

## Format

- Format: SVG (scalable vector graphics)
- All 71 required integration icons are present
- Icons work at any size and are optimized for web display
- Transparent backgrounds where applicable

## Usage in HTML

```html
<img
  src="/docs/assets/integration-icons/{integration-id}.svg"
  alt="{Integration Name} icon"
  onerror="this.src = '/docs/assets/integration-icons/{category}.svg'"
  loading="lazy"
/>
```

## Documentation

See `INTEGRATION_ICONS_SUMMARY.md` in the repository root for complete download details and icon mapping.
