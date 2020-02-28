addEventListener('fetch', event => {
  event.respondWith(bulkRedirects(event.request))
})

async function bulkRedirects(request) {
  try {
  // Get the incoming request URL and path for parsing
  let url = new URL(request.url)
  let path = url.pathname
  console.log("\nPATH: " + path)

  // Match a URL which should redirect from the map
  // This assumes that you've created a KV Namespace
  // and bound it to the variable "REDIRECTS_KV"
  let location301 = await REDIRECTS_KV301.get(path)
//console.log("Redirect Location: " + location301)

  // If it exists, create a redirect and return it
  if (location301) {
    console.log("301 Redirecting to: " + location301)
    return Response.redirect(location301.trim(), 301)
  }

  // 302 redirects
  let location302 = await REDIRECTS_KV302.get(path)
//console.log("Redirect Location: " + location302)

  // If it exists, create a redirect and return it
  if (location302) {
    console.log("302 Redirecting to: " + location302)
    return Response.redirect(location302.trim(), 302)
  }

  // If not, return the original request
  return fetch(request)
  } catch (e) {
    let response = await fetch(request)
    response = new Response(response.body, response)
    response.headers.set('x-cf-wrkr-err', e)
    return response
  }
}
