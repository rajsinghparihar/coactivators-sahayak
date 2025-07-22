from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .subagents.content_simplifier import content_simplifier_agent
from .subagents.variation_generator import variation_generator_agent


MODEL = "gemini-2.5-pro"


differentiated_materials_agent = LlmAgent(
    name="differentiated_materials_agent",
    model=MODEL,
    description=(
        "analyzing seminal papers provided by the users, "
        "providing research advice, locating current papers "
        "relevant to the seminal paper, generating suggestions "
        "for new research directions, and accessing web resources "
        "to acquire knowledge"
    ),
    instruction=prompt.DIFF_MATERIALS_PROMPT,
    output_key="diff_materials",
    tools=[
        AgentTool(agent=content_simplifier_agent),
        AgentTool(agent=variation_generator_agent),
    ],
)

root_agent = differentiated_materials_agent
