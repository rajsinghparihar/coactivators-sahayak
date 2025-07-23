"""variation_generator_agent"""

from google.adk import Agent

from google.adk.tools import google_search
from . import prompt

MODEL = "gemini-2.5-flash"

variation_generator_agent = Agent(
    model=MODEL,
    name="variation_generator_agent",
    instruction=prompt.VARIATION_GENERATION_PROMPT,
    output_key="content_variations",
    # tools=[google_search],
)
