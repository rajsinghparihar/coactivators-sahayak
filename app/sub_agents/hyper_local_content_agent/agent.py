from google.adk.agents import LlmAgent
from .prompt import HYPER_LOCAL_CONTENT_PROMPT
import os

model = os.getenv("MODEL")

hyper_local_content_agent = LlmAgent(
    name="hyper_local_content_agent",
    model=model,
    description="Creates culturally relevant, grade-appropriate educational content in local languages based on the teacher’s request.",
    instruction=HYPER_LOCAL_CONTENT_PROMPT,
)
