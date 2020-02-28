//NOTE: If someone tries to access the site from a country NOT in the list, they'll get an error
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
  /**The `cf-ipcountry` header is not supported in the previewer*/
  const country = request.headers.get('cf-ipcountry')
  const url = countryMap[country]
  return Response.redirect(url)
}
/**
 * A map of the url's to redirect to
 * @param {Object} countryMap
*/
const countryMap = {
  "US" : "https://www.blah.com",
  "MX" : "https://www.blah.mx",
  "PE" : "https://www.blah.pe",
  "CO" : "https://www.blah.co"
}
