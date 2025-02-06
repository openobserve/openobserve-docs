#!/bin/sh

# clear the temp pubic directory
rm -rf site

# Generate static website. Files will be placed in site folder
mkdocs build

# Move the files to S3 bucket for hosting
aws s3 sync ./site s3://zincsearch-website/docs  --exclude=".git/*" --profile=o2-prod

# invalidate cloudfront cache so that latest files can be served
aws cloudfront create-invalidation --distribution-id E3KB2JN7JA8U38 --paths="/docs/*" --profile=o2-prod

