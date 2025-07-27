"""objective_mapper_agent."""

from google.adk import Agent
from . import prompt

MODEL = "gemini-2.5-flash"

objective_mapper_agent = Agent(
    model=MODEL,
    name="objective_mapper_agent",
    instruction=prompt.OBJECTIVE_MAPPING_PROMPT,
    output_key="learning_objectives",
) 