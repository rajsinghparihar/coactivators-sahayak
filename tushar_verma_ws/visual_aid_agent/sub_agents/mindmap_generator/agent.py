from google.adk.agents import LlmAgent
from ... import prompt


MODEL = "gemini-2.5-flash"


mindmap_generator_agent = LlmAgent(
    name="mindmap_generator_agent",
    model=MODEL,
    description=(
        "A specialized agent for creating educational mindmaps and knowledge maps. "
        "This agent helps visualize relationships between concepts, ideas, and information "
        "in a hierarchical, easy-to-understand format appropriate for different grade levels."
    ),
    instruction=prompt.MINDMAP_GENERATOR_PROMPT,
    output_key="mindmap_output",
) 