#!/bin/bash

# Ensure the CSV file only has 1 comma per line, and trailing and ending / = '%2F'
# %2Fold-link,https://www.domain.com/newdestination
  # behaves like this: https://www.domain.com/old-link => https://www.domain.com/newdestination
# %2Fold-link%2F,https://www.domain.com/newdestination
  # behaves like this: https://www.domain.com/old-link/ => https://www.domain.com/newdestination
# %2Fold-link.html,https://www.domain.com/newdestination
  # behaves like this: https://www.domain.com/old-link.html => https://www.domain.com/newdestination

# set variables - change INFILE to match file with redirects
INFILE="./cloudflare-redirs-domain_301s.csv"
i=0
ACCOUNT_ID=""
NAMESPACE_ID="<copy from output of "create_kv_namespace.sh">"
CLOUDFLARE_EMAIL=""
CLOUDFLARE_AUTH_KEY=""

# loop through csv file with list of redirects
while IFS=, read -r redir_from redir_to
do

  curl "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces/$NAMESPACE_ID/values/$redir_from" \
    -X PUT \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_AUTH_KEY" \
    --data $redir_to

i=$((i + 1))
done < $INFILE
