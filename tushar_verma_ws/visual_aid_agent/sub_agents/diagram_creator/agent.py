from google.adk.agents import LlmAgent
from ... import prompt
from .tools import generate_image_from_prompt, render_mermaid_diagram
from google.adk.tools import FunctionTool
MODEL = "gemini-2.5-flash"


generate_image_tool = FunctionTool(func=generate_image_from_prompt)
render_mermaid_tool = FunctionTool(func=render_mermaid_diagram)

diagram_creator_agent = LlmAgent(
    name="diagram_creator_agent",
    model=MODEL,
    description=(
        "A specialized agent for creating educational diagrams, flowcharts, process diagrams, "
        "and visual representations. This agent illustrates concepts, processes, and structures "
        "through clear, informative diagrams appropriate for different educational levels."
    ),
    instruction=prompt.DIAGRAM_CREATOR_PROMPT,
    output_key="diagram_output",
    tools=[generate_image_tool, render_mermaid_tool],
) 