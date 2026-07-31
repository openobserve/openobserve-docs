#!/bin/sh
set -e

# clear the previous export
rm -rf out

# Generate static website. Files will be placed in the out folder
pnpm build

# Move the files to S3 bucket for hosting
aws s3 sync ./out s3://openobserve-staging-website/docs  --exclude=".git/*" --profile=o2-prod

# The search index has no file extension, so `sync` labels it binary/octet-stream
# and CloudFront then refuses to compress it (~37 MB raw vs ~4 MB gzipped).
aws s3 cp ./out/api/search s3://openobserve-staging-website/docs/api/search \
  --content-type application/json --profile=o2-prod

# Raw Markdown is served for LLM crawlers and the "Copy page" menu.
aws s3 cp ./out s3://openobserve-staging-website/docs \
  --recursive --exclude "*" --include "*.md" \
  --content-type "text/markdown; charset=utf-8" --metadata-directive REPLACE --profile=o2-prod

# invalidate cloudfront cache so that latest files can be served
aws cloudfront create-invalidation --distribution-id EZ2SEJVXM7NXL --paths="/docs/*" --profile=o2-prod
