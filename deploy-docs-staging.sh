#!/bin/sh
# Manual staging deploy. The automated equivalent is
# .github/workflows/deploy-docs-staging.yaml, which runs on every push to dev.
#
# Bucket and distribution are kept in step with that workflow. They used to
# differ (openobserve-staging-website / EZ2SEJVXM7NXL), values last set here in
# June 2025, before the staging environment was created that September;
# EZ2SEJVXM7NXL now fronts production, so the old pairing would have published to
# one bucket and invalidated another.
set -e

BUCKET=s3://openobserve-website-staging/docs
DISTRIBUTION=E2GZJM0TJIDFRM
PROFILE=o2-prod

# clear the previous export
rm -rf out

# Generate static website. Files will be placed in the out folder
pnpm build

# Move the files to S3 bucket for hosting. The search index is handled below.
aws s3 sync ./out "$BUCKET" --exclude=".git/*" \
  --exclude "api/search.json*" --profile="$PROFILE"

# The search index is ~37 MB and CloudFront only auto-compresses objects under
# 10 MB, so the gzipped copy scripts/post-export.mjs writes is published instead
# (~4.7 MB). Browsers decode `Content-Encoding: gzip` transparently.
aws s3 cp ./out/api/search.json.gz "$BUCKET/api/search.json" \
  --content-type application/json --content-encoding gzip --profile="$PROFILE"

# Raw Markdown is served for LLM crawlers and the "Copy page" menu.
aws s3 cp ./out "$BUCKET" \
  --recursive --exclude "*" --include "*.md" \
  --content-type "text/markdown; charset=utf-8" --profile="$PROFILE"

# invalidate cloudfront cache so that latest files can be served
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths="/docs/*" --profile="$PROFILE"
