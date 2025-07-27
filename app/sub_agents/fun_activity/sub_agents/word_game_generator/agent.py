"""word_game_generator_agent."""

from google.adk import Agent

# from google.adk.tools import google_search
from . import prompt

MODEL = "gemini-2.5-flash"

word_game_generator_agent = Agent(
    model=MODEL,
    name="word_game_generator_agent",
    instruction=prompt.WORD_GAME_GENERATION_PROMPT,
    output_key="word_game_activities",
    # tools=[google_search],
)
