"""variation_generator_agent"""

import os

from google.adk import Agent
from . import prompt

MODEL = os.getenv("MODEL")

variation_generator_agent = Agent(
    model=MODEL,
    name="variation_generator_agent",
    instruction=prompt.VARIATION_GENERATION_PROMPT,
    output_key="content_variations",
)
