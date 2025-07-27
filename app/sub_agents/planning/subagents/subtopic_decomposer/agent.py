"""subtopic_decomposer_agent."""

from google.adk import Agent
from . import prompt

MODEL = "gemini-2.5-flash"

subtopic_decomposer_agent = Agent(
    model=MODEL,
    name="subtopic_decomposer_agent",
    instruction=prompt.SUBTOPIC_DECOMPOSITION_PROMPT,
    output_key="subtopic_breakdown",
) 