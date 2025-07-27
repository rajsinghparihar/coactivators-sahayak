# ADK Agent Deployment Guide

## Overview
This guide explains how to deploy your ADK (Agent Development Kit) agent to production using Vertex AI Agent Engine.

## Prerequisites

### 1. Google Cloud Project Setup

#### Create or Select a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Either:
   - **Create a new project**: Click "Select a project" → "New Project" → Enter project name → "Create"
   - **Use existing project**: Click "Select a project" → Choose your project

#### Enable Required APIs
Agent Engine deployment requires 5 APIs to be enabled. **You must enable each API individually** - they are not automatically enabled as dependencies.

1. Go to [APIs & Services → Library](https://console.cloud.google.com/apis/library)
2. Search for and enable each API by clicking "Enable":
   - **Vertex AI API** - For AI models and Agent Engine. Click enable all recommended services to speed up the process.
   - **Cloud Storage API** - For staging bucket  
   - **Cloud Build API** - For building agent containers
   - **Cloud Run Admin API** - For deployment infrastructure
   - **Artifact Registry API** - For container storage

**Quick Links to Enable APIs:**
- [Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)
- [Cloud Storage API](https://console.cloud.google.com/apis/library/storage.googleapis.com)
- [Cloud Build API](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com)
- [Cloud Run Admin API](https://console.cloud.google.com/apis/library/run.googleapis.com)
- [Artifact Registry API](https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com)

#### Set up Billing
Agent Engine requires a billing account:
1. Go to [Billing](https://console.cloud.google.com/billing)
2. Link your project to a billing account
3. **Note:** Vertex AI offers free tier usage, but you need billing enabled

#### Required IAM Permissions
Your account needs the following roles for Agent Engine deployment:
- **Vertex AI Administrator** (`roles/aiplatform.admin`) - For Agent Engine operations
- **Storage Admin** (`roles/storage.admin`) - For staging bucket access
- **Cloud Build Editor** (`roles/cloudbuild.builds.editor`) - For building containers
- **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`) - For API access

**For production deployments**, create a dedicated service account with these specific roles instead of using your personal account.

### 2. Create Storage Bucket
You need a Cloud Storage bucket for staging deployment artifacts:

1. Go to [Cloud Storage](https://console.cloud.google.com/storage)
2. Click **Create Bucket**
3. **Bucket Configuration:**
   - **Name**: Choose a globally unique name (e.g., `your-project-id-agent-staging`)
   - **Location Type**: Region (recommended)
   - **Location**: Choose same region as your `GOOGLE_CLOUD_LOCATION` (e.g., `us-central1`)
   - **Storage Class**: Standard
   - **Access Control**: Uniform (recommended)
   - **Protection Tools**: Use defaults
4. Click **Create**
5. **Save the bucket name** - Update GOOGLE_CLOUD_STORAGE_BUCKET in your .env file.

### 3. Authentication Setup
Install Google Cloud CLI and authenticate:

#### Install Google Cloud CLI
- **Windows/Mac/Linux**: Follow instructions at [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
- **Alternative**: Use [Google Cloud Shell](https://shell.cloud.google.com/) (no installation needed)

#### Authenticate and Set Default Project
```bash
# Authenticate with your Google account
gcloud auth application-default login

# Set your project as default
gcloud config set project YOUR-PROJECT-ID

# Verify your setup
gcloud config list
```

### 4. Environment Variables
Create an environment file with your configuration:

```bash
# Create .env.example file first (if it doesn't exist)
# Then copy it to .env and fill in your values
cp app/.env.example app/.env

# Edit app/.env with your values
```
**Note:** If you've set your default project with `gcloud config set project`, the `GOOGLE_CLOUD_PROJECT` in `.env` is optional.

## ✅ Pre-Deployment Checklist

Before deploying your agent, verify you have completed:

- [ ] **Google Cloud Project** - Created or selected project
- [ ] **APIs Enabled** - All 5 required APIs enabled (Vertex AI, Cloud Storage, Cloud Build, Cloud Run, Artifact Registry)
- [ ] **Billing Setup** - Billing account linked to project
- [ ] **Storage Bucket** - Created staging bucket in same region as deployment
- [ ] **Google Cloud CLI** - Installed and authenticated (`gcloud auth application-default login`)
- [ ] **Default Project** - Set with `gcloud config set project PROJECT_ID`
- [ ] **Environment File** - Created `.env.example` (if needed) and copied to `.env` with all values filled in
- [ ] **Dependencies** - `pyproject.toml` contains all required ADK dependencies  
- [ ] **Agent Code** - Follows required ADK structure (see below)

### 3. Agent Structure
Your ADK agent should follow this structure:
```
app/
├── __init__.py
├── agent.py           # Contains your agent definition
├── pyproject.toml     # Modern dependency management
└── .env              # Environment variables
```

**Note:** This project uses `pyproject.toml` for modern Python dependency management. All required dependencies are defined there, eliminating the need for a separate `requirements.txt` file.

## Agent Code Structure

### Required Format
Your `agent.py` should contain:
```python
from google.adk.agents import Agent

# Define your agent
root_agent = Agent(
    name="your_agent_name",
    model="gemini-2.5-flash", 
    description="Agent description",
    instruction="Agent instructions",
)
```

### Your `__init__.py` should contain:
```python
from . import agent
```

## Deployment to Agent Engine (Recommended)

The **Agent Engine** is the recommended deployment target for ADK agents. It provides a fully managed, serverless runtime specifically optimized for AI agents with built-in session management, scaling, and enterprise-grade security.

### Using ADK CLI (Recommended)
Deploy your agent using the ADK CLI command:

```bash
# Navigate to your agent directory
cd path/to/your/agent/

# Simple deployment (everything configured via .env)
uv run adk deploy agent_engine app

# With optional display parameters
adk deploy agent_engine \
--display_name="Research Assistant Agent" \
--description="An AI agent for research and analysis tasks" \
app
```

### Required Setup
- **Configured `.env` file**: Must include `GOOGLE_CLOUD_STAGING_BUCKET`
- **Agent directory**: Path to your agent code (usually `app`)

### Optional Parameters
- `--display_name`: Human-readable name for your agent
- `--description`: Description of your agent's purpose
- `--project`: Override project from `.env` or gcloud default
- `--region`: Override region from `.env`



### Alternative: Python SDK Approach
If you prefer to deploy programmatically:

```python
from vertexai.preview.reasoning_engines import AdkApp
from google.adk.agents import Agent

# Your agent definition
app = AdkApp(agent=your_agent)

# Deploy to Agent Engine
remote_agent = app.deploy(
    # Dependencies are automatically read from pyproject.toml
    display_name="Your Agent Name", 
    description="Agent description",
    env_vars={
        "GOOGLE_CLOUD_PROJECT": "your-project-id",
        "GOOGLE_CLOUD_LOCATION": "us-central1",
        "GOOGLE_GENAI_USE_VERTEXAI": "True"
    }
)
```

### Why Agent Engine?
- **Managed Infrastructure**: No need to manage servers or containers
- **Built-in Session Management**: Automatic state persistence across conversations
- **Enterprise Security**: IAM integration and VPC controls
- **Automatic Scaling**: Scales from zero to handle any load
- **Monitoring & Logging**: Built-in observability and debugging tools
- **Cost Effective**: Pay only for what you use

## Alternative Deployment: Cloud Run (Advanced Users)

For users who need more control over the deployment environment, Cloud Run is available as an alternative:

```bash
adk deploy cloud_run \
--project=$GOOGLE_CLOUD_PROJECT \
--region=$GOOGLE_CLOUD_LOCATION \
--service_name=your-agent-service \
--app_name=your-agent-app \
--with_ui \
path/to/your/agent/
```

**Note**: We recommend Agent Engine for most use cases as it provides better integration with Vertex AI services and managed session handling.

## Complete Deployment Example

Here's a complete example of deploying an agent to Agent Engine:

```bash
# 1. Authenticate with Google Cloud and set default project
gcloud auth application-default login
gcloud config set project your-project-id

# 2. Set up environment variables
cp app/.env.example app/.env
# Edit app/.env with your project details and staging bucket

# 3. Navigate to your agent directory
cd /path/to/your/agent/

# 4. Test locally first (optional but recommended)
adk web

# 5. Deploy to Agent Engine (simple command!)
adk deploy agent_engine app

# 6. The command will output the agent resource ID for future reference
# Example output: projects/123456/locations/us-central1/reasoningEngines/your-agent-id
```

**Note:** Make sure you've completed all the prerequisites above, including enabling APIs and creating your staging bucket.

### Expected Output
After successful deployment, you'll see:
```
✓ Agent deployed successfully!
Resource ID: projects/your-project-id/locations/us-central1/reasoningEngines/abc123
Agent URL: https://console.cloud.google.com/vertex-ai/agents/...
```

**Important:** Save the Resource ID - you'll need it for integrating with your application and testing the deployed agent.

## Integration with Your Current App

### Backend Integration
Your current Flask/FastAPI backend can integrate with the deployed ADK agent on Agent Engine:

```python
from vertexai.preview.reasoning_engines import AdkApp

# Connect to your deployed agent using the resource ID from deployment
agent_resource_id = "projects/your-project-id/locations/us-central1/reasoningEngines/your-agent-id"
app = AdkApp.get_agent(agent_id=agent_resource_id)

# Use in your API endpoints
@app.post("/chat")
async def chat(request):
    response = app.query(
        user_id=request.user_id,
        session_id=request.session_id,
        message=request.message
    )
    return response
```

### Direct API Integration
You can also integrate directly with the Agent Engine API:

```python
from google.cloud import aiplatform

# Initialize the client
client = aiplatform.gapic.ReasoningEngineServiceClient()

# Query the deployed agent
response = client.query_reasoning_engine(
    name="projects/your-project-id/locations/us-central1/reasoningEngines/your-agent-id",
    input={"query": "Hello, agent!"}
)
```

### Frontend Integration
Your React frontend can interact with the deployed agent via your backend API or directly via the Agent Engine REST API with proper authentication.

## Testing Your Deployment

### Local Testing
```bash
# Test locally first
adk web  # Opens web UI at http://localhost:8000
```

### After Agent Engine Deployment
Once you deploy with `adk deploy agent_engine app`, you'll receive deployment information including:
- Agent Engine resource ID
- Deployment status
- Access information

### Production Testing
After successful deployment, you can test your agent using the Vertex AI console or API:

```bash
# Test deployed agent via API
curl -X POST "https://REGION-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/REGION/reasoningEngines/AGENT_ID:query" \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
-H "Content-Type: application/json" \
-d '{
  "input": {
    "query": "Hello, agent!"
  }
}'
```

### Using the Vertex AI Console
1. Navigate to the Vertex AI console
2. Go to Agent Engine section
3. Find your deployed agent
4. Use the built-in testing interface to interact with your agent

## Important Notes

1. **Model Selection**: Use `gemini-2.5-flash` for faster responses or `gemini-2.5-pro` for more complex reasoning
2. **Location**: Use `us-central1`, `us-east1`, or other valid regions (not "global")
3. **Authentication**: Ensure proper service account permissions for production deployment
4. **Environment Variables**: Never hardcode credentials; use environment variables or Secret Manager
5. **Session Management**: Agent Engine provides managed sessions for state persistence

## Next Steps

1. Convert your current agent logic to ADK format
2. Test locally with `adk web`
3. Deploy to Agent Engine using `adk deploy agent_engine app`
4. Integrate with your existing frontend/backend
5. Monitor and manage your deployed agent through the Vertex AI console

## Troubleshooting

### GCP Setup Issues
- **Project not found**: Make sure you've selected the correct project in the GCP Console and set it as default with `gcloud config set project PROJECT_ID`
- **APIs not enabled**: Double-check that all required APIs are enabled in [APIs & Services](https://console.cloud.google.com/apis/library)
- **Billing not set up**: Agent Engine requires billing to be enabled on your project
- **Insufficient permissions**: Your account needs Owner or Editor role, or specific IAM roles for Vertex AI and Cloud Storage

### Authentication Issues
- **Not authenticated**: Run `gcloud auth application-default login`
- **Wrong project**: Verify with `gcloud config list` and set with `gcloud config set project PROJECT_ID`
- **Service account issues**: For production, ensure your service account has necessary permissions

### Deployment Issues
- **Staging bucket errors**: 
  - Verify bucket exists: `gsutil ls gs://your-bucket-name`
  - Check bucket permissions: Your account needs Storage Admin role
  - Ensure bucket region matches `GOOGLE_CLOUD_LOCATION`
- **Permission Errors**: Ensure your account has Vertex AI Agent Engine permissions
- **Model Access**: Some models may require allowlisting for your project
- **Region Issues**: Use valid regions like `us-central1` instead of `global`

### Environment Configuration
- **Missing .env file**: Make sure you've copied `.env.example` to `.env` and filled in values
- **Invalid bucket URI**: Use format `gs://bucket-name` not `bucket-name`
- **Network issues**: If behind corporate firewall, ensure access to `*.googleapis.com`

## Documentation References

- [ADK Documentation](https://google.github.io/adk-docs/)
- [Agent Engine Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview)
- [Deploy an Agent](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/deploy)

## 💰 Costs and Quotas

### Expected Costs
- **Agent Engine**: Pay-per-use pricing based on requests and compute time
- **Cloud Storage**: Minimal cost for staging artifacts (~$0.02/GB/month)
- **Vertex AI Models**: Usage-based pricing (Gemini models have generous free tiers)
- **Cloud Build**: Free tier includes 120 build-minutes per day

### Quotas to be Aware Of
- **Vertex AI API requests**: Default quotas are usually sufficient for development
- **Cloud Storage**: 5TB free tier for most storage classes
- **Agent Engine instances**: Regional quotas apply

### Cost Optimization Tips
- Use `gemini-2.5-flash` for development (lower cost than `gemini-2.5-pro`)
- Set up budget alerts in [Billing](https://console.cloud.google.com/billing)
- Delete unused staging artifacts periodically
- Consider using Cloud Storage lifecycle policies for automatic cleanup

For detailed pricing, visit [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator). 
