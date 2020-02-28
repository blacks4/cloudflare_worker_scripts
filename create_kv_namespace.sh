#!/bin/bash

# set variables
ACCOUNT_ID=""
CLOUDFLARE_EMAIL=""
CLOUDFLARE_AUTH_KEY=""
NAMESPACENAME="" # format is domain_"redirects"_date

# create namespace
curl "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces" \
  -X POST \
  -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
  -H "X-Auth-Key: $CLOUDFLARE_AUTH_KEY" \
  -H "Content-Type: application/json" \
  --data "{\"title\":\"$NAMESPACENAME\"}"
