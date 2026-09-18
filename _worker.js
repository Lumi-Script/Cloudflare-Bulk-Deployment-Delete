export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const targetUrl = new URL(url.pathname.replace(/^\/api\//, ''), 'https://api.cloudflare.com/client/v4/');
      targetUrl.search = url.search;
      
      const newRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow'
      });
      
      return fetch(newRequest);
    }
    
    // Otherwise, let Cloudflare serve the static asset
    return env.ASSETS.fetch(request);
  }
};
