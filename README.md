# Cloudflare Bulk Deployment Delete

A sleek, enterprise-grade React tool to easily and securely bulk-delete old Cloudflare Pages deployments.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Lumi-Script/Cloudflare-Bulk-Deployment-Delete)

## Features

- **Automated Pagination:** Fetches all your deployments seamlessly, no matter how many you have.
- **Proxy Support:** Includes a Cloudflare Worker proxy (`worker.js`) to securely bypass CORS when interfacing with the Cloudflare API.
- **Enterprise Design:** Beautiful, minimalist UI inspired by modern SaaS platforms.
- **Secure:** Operates entirely in your browser. API keys are sent directly to Cloudflare and are never stored.

## Local Development

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Visit `http://localhost:5173`

## Deployment

Click the "Deploy to Cloudflare" button above to automatically provision and deploy this tool to your own Cloudflare account using Workers Static Assets.

Alternatively, you can manually build and deploy using Wrangler:

```bash
npm run build
npx wrangler deploy
```

## Minimum API Key Access
Create a Custom API Token at **Cloudflare Dashboard &rarr; My Profile &rarr; API Tokens** with:
- **Permissions:** Account | Cloudflare Pages | Edit
- **Account Resources:** Include | *Your Account*
