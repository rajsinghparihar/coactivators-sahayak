"""content_simplifier_agent."""

from google.adk import Agent
from google.adk.tools import google_search
from . import prompt

MODEL = "gemini-2.5-flash"

content_simplifier_agent = Agent(
    model=MODEL,
    name="content_simplifier_agent",
    instruction=prompt.CONTENT_SIMPLIFICATION_PROMPT,
    output_key="recent_citing_papers",
    tools=[google_search],
)
