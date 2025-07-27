from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from ... import prompt
from .tools import generate_image_from_prompt, render_mermaid_diagram
import os

MODEL = os.getenv("MODEL")


generate_image_tool = FunctionTool(func=generate_image_from_prompt)
render_mermaid_tool = FunctionTool(func=render_mermaid_diagram)


visual_guide_generator_agent = LlmAgent(
    name="visual_guide_generator_agent",
    model=MODEL,
    description=(
        "A specialized agent for creating step-by-step visual learning guides, instructional graphics, "
        "and educational visual aids. This agent breaks down complex concepts into digestible visual steps "
        "that help teachers explain concepts through structured, sequential visual representations."
    ),
    instruction=prompt.VISUAL_GUIDE_GENERATOR_PROMPT,
    output_key="visual_guide_output",
    tools=[generate_image_tool, render_mermaid_tool],
)
