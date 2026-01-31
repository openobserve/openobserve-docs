# Icon Download Script for OpenObserve Integrations

This script helps download integration icons from various sources.

## Manual Download Instructions

Since automated downloading may face CORS/authentication issues, here are manual steps:

### Option 1: Use Existing Brand Logos
Download official logos from each technology's website:
- Kubernetes: https://kubernetes.io/images/kubernetes-horizontal-color.png
- PostgreSQL: https://wiki.postgresql.org/wiki/Logo
- MySQL: https://www.mysql.com/about/legal/logos.html
- MongoDB: https://www.mongodb.com/company/newsroom/media-assets
- Redis: https://redis.io/docs/about/logos/
- Kafka: https://kafka.apache.org/images/apache-kafka.png
- Nginx: https://www.nginx.com/press/
- AWS: https://aws.amazon.com/architecture/icons/

### Option 2: Use Icon Libraries
- Simple Icons: https://simpleicons.org/
- DevIcon: https://devicon.dev/
- SVG Repo: https://www.svgrepo.com/

### Option 3: Use AI-Generated Placeholder Icons
For integrations without official logos, use consistent placeholder icons by category.

## Icon Specifications
- Format: SVG (preferred) or PNG
- Size: 32x32px to 128x128px
- Background: Transparent
- Style: Flat, modern, consistent with OpenObserve branding

## Naming Convention
Save icons with the integration ID from integrations.json:
- `kubernetes.svg`
- `postgresql.svg`
- `mysql.svg`
- etc.

## Category Icons (Generic Fallbacks)
Create generic icons for each category when specific logos aren't available:
- cloud.svg - Cloud/server icon
- database.svg - Database cylinder icon
- messaging.svg - Message queue icon
- os.svg - Operating system icon
- server.svg - Server/rack icon
- devops.svg - Pipeline/automation icon
