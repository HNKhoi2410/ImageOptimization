const IMAGE_RESIZE_MESSAGES = {
  9401: "Missing or invalid arguments in {cf:image{...}} options.",
  9402: "Image too large or connection interrupted.",
  9403: "Request loop detected. Image already resized or Worker fetched its own URL.",
  9406: "Non-HTTPS URL, URL with spaces, or unescaped Unicode.",
  9407: "Lookup error with origin server's domain name.",
  9404: "Image does not exist on origin server or URL is wrong.",
  9408: "Origin server returned HTTP 4xx status code.",
  9509: "Origin server returned HTTP 5xx status code.",
  9412: "Origin server returned a non-image (HTML page, error, login page).",
  9413: "Image exceeds maximum area (100 megapixels).",
  9420: "Origin server redirected to an invalid URL.",
  9421: "Origin server redirected too many times.",
  9504: "Origin server could not be contacted (down or overloaded).",
  9505: "Origin server could not be contacted (down or overloaded).",
  9510: "Origin server could not be contacted (down or overloaded).",
  9523: "Resizing service could not perform resizing (invalid format).",
  9524: "Resizing service could not perform resizing (Worker intercepting URL, pages.dev URL).",
  9511: "Unsupported image format.",
  9522: "Image exceeded processing limit (after purging or large files).",
  9424: "Internal error.",
  9516: "Internal error.",
  9517: "Internal error.",
  9518: "Internal error.",
  9523: "Internal error.",
};

function handleFailureResponse(response, originalRequest) {
  const cfResized = response.headers.get('Cf-Resized');
  if (!cfResized) return fetch(originalRequest);

  const match = cfResized.match(/err=(\d*)/);
  if (!match) return fetch(originalRequest);

  const error = {
    code: match[1],
    message: IMAGE_RESIZE_MESSAGES[match[1]],
  };

  console.log(JSON.stringify(error));

  return new Response(error, { status: 404 });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  let requestUrl = new URL(request.url);

  let match = requestUrl.pathname.match(/images-proxy\/(.+)([png]|[jpeg]|[jpg])|[svg]|[avif]|[webp]/);
  if (!match) {
    return new Response('Not Found', { status: 404 });
  }

  let resizingOptions = { cf: { image: {} } };
  const allowedParams = ["width", "height", "fit", "quality", "anim", "format", "compression", "dpr"];

  allowedParams.forEach(param => {
    if (requestUrl.searchParams.has(param)) resizingOptions.cf.image[param] = requestUrl.searchParams.get(param);
  });

  let imageUrl = 'https://' + requestUrl.host + '/images/' + match[1] ; // S3 Proxy

  let imageRequest = new Request(imageUrl, { headers: request.headers });

  return fetch(imageRequest, resizingOptions)
    .then(response => {
      if (response.ok) {
        return response;
      } else {
        return handleFailureResponse(response, imageRequest);
      }
    })
    .catch(_ => fetch(imageRequest));
}