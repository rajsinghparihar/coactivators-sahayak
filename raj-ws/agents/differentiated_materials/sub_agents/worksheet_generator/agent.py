"""worksheet_generator_agent."""

from google.adk import Agent

# from google.adk.tools import google_search
from . import prompt

MODEL = "gemini-2.5-flash"

worksheet_generator_agent = Agent(
    model=MODEL,
    name="worksheet_generator_agent",
    instruction=prompt.WORKSHEET_GENERATION_PROMPT,
    output_key="baseline_worksheet",
    # tools=[google_search],
)
