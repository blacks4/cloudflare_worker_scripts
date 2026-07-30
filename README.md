# Cloudflare Worker Scripts

Small collection of Cloudflare Worker examples for URL redirects, country-based redirects, and IP allow-list redirects. The redirect examples use Cloudflare Workers KV for lookup data.

## Files

| File | Purpose |
| --- | --- |
| `301_redirects.js` | Looks up the request path in a KV namespace and issues a `301` redirect when a match is found. |
| `301_and_302_redirects.js` | Checks one KV namespace for `301` redirects, then a second namespace for `302` redirects. |
| `geo_redirect.js` | Redirects visitors based on the Cloudflare `cf-ipcountry` request header. Countries not listed in the map will fail because there is no fallback URL. |
| `geo_redirect_with_default.js` | Redirects visitors based on country, with a default URL when the country is not listed. |
| `ip-redirect.js` | Allows requests from IPs stored in KV and redirects all other IPs to another URL. |
| `create_kv_namespace.sh` | Creates a Cloudflare Workers KV namespace through the Cloudflare API. |
| `populate_kv_namespace.sh` | Uploads redirect mappings from a CSV file into a KV namespace. |

## Prerequisites

- A Cloudflare account with Workers enabled.
- A deployed Cloudflare Worker route or custom domain.
- Cloudflare API credentials:
  - Account ID
  - Account email
  - Global API key or compatible auth key
- Workers KV namespace bindings configured for the Worker script you deploy.

## Redirect Workers

### `301_redirects.js`

This Worker reads the request path from `request.url`, looks up that path in KV, and redirects to the stored value when found.

Expected KV binding:

```text
REDIRECTS_KV
```

Example KV entries:

| Key | Value |
| --- | --- |
| `/old-page` | `https://www.example.com/new-page` |
| `/old-page/` | `https://www.example.com/new-page` |
| `/old-page.html` | `https://www.example.com/new-page` |

If no KV entry exists for the request path, the Worker passes the request through to origin with `fetch(request)`.

### `301_and_302_redirects.js`

This Worker supports both permanent and temporary redirects. It checks the `301` namespace first, then the `302` namespace.

Expected KV bindings:

```text
REDIRECTS_KV301
REDIRECTS_KV302
```

Lookup order:

1. If the path exists in `REDIRECTS_KV301`, return a `301` redirect.
2. If the path exists in `REDIRECTS_KV302`, return a `302` redirect.
3. Otherwise, pass the request through to origin.

## Geo Redirect Workers

Cloudflare adds the visitor country code to the `cf-ipcountry` request header when the request runs through Cloudflare. This header is not available in the local/preview environment.

### `geo_redirect.js`

Redirects visitors based on the `countryMap` object:

```js
const countryMap = {
  "US" : "https://www.blah.com",
  "MX" : "https://www.blah.mx",
  "PE" : "https://www.blah.pe",
  "CO" : "https://www.blah.co"
}
```

Requests from countries not included in `countryMap` do not have a fallback destination.

### `geo_redirect_with_default.js`

Works the same way as `geo_redirect.js`, but sends unlisted countries to a default URL:

```js
if (!url) {
  url = 'http://www.blah.com'
}
```

Update `countryMap` and the fallback URL before deploying.

## IP Redirect Worker

`ip-redirect.js` reads the visitor IP from Cloudflare's `cf-connecting-ip` header and looks up the IP in KV.

Expected KV binding:

```text
ALLOWED_IPS
```

Each allowed IP should be stored as both the KV key and value:

| Key | Value |
| --- | --- |
| `203.0.113.10` | `203.0.113.10` |

If the source IP is not found, the Worker redirects to:

```text
https://challenge.developers.cloudflare.com/
```

Update that URL before deploying if you need a different deny destination.

## Creating a KV Namespace

Edit the variables in `create_kv_namespace.sh`:

```bash
ACCOUNT_ID=""
CLOUDFLARE_EMAIL=""
CLOUDFLARE_AUTH_KEY=""
NAMESPACENAME=""
```

Then run:

```bash
chmod +x create_kv_namespace.sh
./create_kv_namespace.sh
```

Copy the namespace ID from the Cloudflare API response. You will need it when binding the namespace to your Worker and when populating data.

## Populating Redirect KV Data

Edit the variables in `populate_kv_namespace.sh`:

```bash
INFILE="./cloudflare-redirs-domain_301s.csv"
ACCOUNT_ID=""
NAMESPACE_ID=""
CLOUDFLARE_EMAIL=""
CLOUDFLARE_AUTH_KEY=""
```

The CSV file should contain one redirect per line:

```csv
%2Fold-link,https://www.domain.com/newdestination
%2Fold-link%2F,https://www.domain.com/newdestination
%2Fold-link.html,https://www.domain.com/newdestination
```

The first column is the URL-encoded path key and the second column is the redirect destination. Keep exactly one comma per line.

Run:

```bash
chmod +x populate_kv_namespace.sh
./populate_kv_namespace.sh
```

## Deployment Notes

- Bind each KV namespace using the exact variable name expected by the selected Worker script.
- Replace placeholder URLs such as `https://www.blah.com` before deploying.
- Test redirect behavior against a deployed Worker route because Cloudflare-specific headers such as `cf-ipcountry` and `cf-connecting-ip` depend on Cloudflare's edge runtime.
- For path redirects, include separate KV keys for slash and non-slash variants when both should redirect.
