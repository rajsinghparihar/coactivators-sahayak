"""worksheet_generator_agent."""

import os

from google.adk.agents import LlmAgent, SequentialAgent

from . import prompt
from .tools import calculator

MODEL = os.getenv("MODEL")

worksheet_creator_agent = LlmAgent(
    model=MODEL,
    name="worksheet_creator_agent",
    instruction=prompt.WORKSHEET_CREATION_PROMPT,
    output_key="baseline_worksheet",
    description="You create a worksheet from the given context.",
)

answersheet_creator_agent = LlmAgent(
    model=MODEL,
    name="answerkey_creator_agent",
    instruction=prompt.ANSWERSHEET_CREATION_PROMPT,
    output_key="baseline_answersheet",
    description="You create an answersheet or rubrics for short answer questions based on the worksheet generated in the previous step",
)


worksheet_generator_agent = SequentialAgent(
    name="worksheet_generator_agent",
    sub_agents=[worksheet_creator_agent, answersheet_creator_agent],
    description="Executes a two step pipeline: worksheet creation and answersheet creation",
)
