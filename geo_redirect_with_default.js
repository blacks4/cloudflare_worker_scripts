//NOTE: this will load http://www.blah.com by default unless the origin country is listed at the bottom
async function handleRequest(request) {
  return redirect(request, 'subdomain')
}
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Returns a redirect determined by the country code
 * @param {Request} request
 */
function redirect(request) {
    try {
  /**The `cf-ipcountry` header is not supported in the previewer*/
  const country = request.headers.get('cf-ipcountry')
  let url = countryMap[country]
    if (!url) {
      url = 'http://www.blah.com'
    }
  return Response.redirect(url)
  } catch (err) {
    // Return the error stack as the response
    return new Response(err.stack || err)
  }
}
/**
 * A map of the url's to redirect to
 * @param {Object} countryMap
*/
const countryMap = {
  "PT" : "https://en.wikipedia.org/wiki/Portugal",
  "PL" : "https://en.wikipedia.org/wiki/Poland",
  "NO" : "https://en.wikipedia.org/wiki/Norway"
}
