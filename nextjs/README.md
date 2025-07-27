This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Configuration

### Local Development
Create a `.env.local` file in the `nextjs` directory with the following configuration:

```bash
# Backend URL for local development
BACKEND_URL=http://127.0.0.1:8000

# Environment mode
NODE_ENV=development
```

### Agent Engine Deployment
For Agent Engine deployment, create a `.env.local` file with:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Agent Engine Configuration
REASONING_ENGINE_ID=your-reasoning-engine-id

# Optional: Direct Agent Engine endpoint URL
# AGENT_ENGINE_ENDPOINT=https://us-central1-aiplatform.googleapis.com/v1/projects/your-project-id/locations/us-central1/reasoningEngines/your-reasoning-engine-id

# Environment mode
NODE_ENV=production
```

### Cloud Run Deployment
For Cloud Run deployment, create a `.env.local` file with:

```bash
# Cloud Run Service URL
CLOUD_RUN_SERVICE_URL=https://your-service-url.a.run.app

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Environment mode
NODE_ENV=production
```

### Configuration Priority
The system automatically detects the deployment type based on available environment variables:
1. **Agent Engine**: When `REASONING_ENGINE_ID` or `AGENT_ENGINE_ENDPOINT` is set
2. **Cloud Run**: When `CLOUD_RUN_SERVICE_URL` or `K_SERVICE` is set
3. **Local**: Default fallback for development

### Debugging
Enable detailed logging by setting:
```bash
DEBUG_ENDPOINTS=true
DEBUG_AGENT_ENGINE=true
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
