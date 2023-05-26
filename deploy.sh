#!/bin/sh

# clear the temp pubic directory
rm -rf site

# Generate static website. Files will be placed in site folder
mkdocs build

# Move the files to S3 bucket for hosting
aws s3 sync ./site s3://zincobserve-docs/ --profile=zinc-prod

# invalidate cloudfront cache so that latest files can be served docs.openobserve.ai
aws cloudfront create-invalidation --distribution-id E1V2HOO0EH8BBG --paths=/* --profile=zinc-prod

