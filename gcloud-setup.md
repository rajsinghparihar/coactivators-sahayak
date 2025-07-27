# Google Cloud Vertex AI Setup

#### Prerequisite: 
Create a google cloud account, create a project, and enable Vertex AI API in Google Cloud.

#### Resources:

- [Getting Started guide to Vertex AI in Google cloud](https://cloud.google.com/vertex-ai/generative-ai/docs/start/api-keys?usertype=existinguser)
- [API Quickstart](https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart?usertype=adc#gen-ai-sdk-for-python)

#### Step 1:
run `bash gcloud-setup.sh` and complete installation as prompted

#### Step 2:
Open a new terminal and run `gcloud init`.
This will prompt you to select a project in your google cloud.

#### Step 3:
run `gcloud auth application-default login` to setup the ADC (application default credentials) for Vertex AI.

#### Step 4:
Once done with all steps, go to API Quickstart in the [Resources](####Resources) section to see the guide for setting up environment variables
and inferencing with Gemini API
