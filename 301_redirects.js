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
  let location = await REDIRECTS_KV.get(path)
//console.log("Redirect Location: " + location)

  // If it exists, create a redirect and return it
  if (location) {
    console.log("301 Redirecting to: " + location)
    return Response.redirect(location.trim(), 301)
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
