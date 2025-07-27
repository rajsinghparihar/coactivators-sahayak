from google.adk.agents import Agent
from .prompt import KNOWLEDGE_BASE_PROMPT
import os

model = os.getenv("MODEL")

knowledge_base_agent = Agent(
    name="knowledge_base_agent",
    model=model,
    description="Provides simple, analogy-rich explanations for complex student questions in the teacher’s preferred language.",
    instruction=KNOWLEDGE_BASE_PROMPT,
)
