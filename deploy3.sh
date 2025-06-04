#!/bin/sh

# clear the temp pubic directory
rm -rf site

# Generate static website. Files will be placed in site folder
mkdocs build

# Move the files to S3 bucket for hosting
aws s3 sync ./site s3://openobserve-staging-website/docs  --exclude=".git/*" --profile=o2-prod

# invalidate cloudfront cache so that latest files can be served
aws cloudfront create-invalidation --distribution-id EZ2SEJVXM7NXL --paths="/docs/*" --profile=o2-prod

