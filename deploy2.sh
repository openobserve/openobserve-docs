#!/bin/sh
set -e

# Production deploy. Requires Node 22 — see README.

# clear the previous static export
rm -rf out

# Generate the static site. Files will be placed in the out folder
npm ci
npm run build
npm run check:rules

# Move the files to S3 bucket for hosting
aws s3 sync ./out s3://openobserve-prod-website/docs  --exclude=".git/*" --profile=o2-prod

# invalidate cloudfront cache so that latest files can be served
aws cloudfront create-invalidation --distribution-id E2GZJM0TJIDFRM --paths="/docs/*" --profile=o2-prod
