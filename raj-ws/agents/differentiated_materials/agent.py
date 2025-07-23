from google.adk.agents import LlmAgent
# from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .sub_agents.content_simplifier import content_simplifier_agent
from .sub_agents.variation_generator import variation_generator_agent
from .sub_agents.worksheet_generator import worksheet_generator_agent
from textwrap import dedent


MODEL = "gemini-2.5-pro"


differentiated_materials_agent = LlmAgent(
    name="differentiated_materials_agent",
    model=MODEL,
    description=(
        dedent("""
        You are a manager agent that is responsible for overseeing the work of the other agents.

        Always delegate the task to the appropriate agent. Use your best judgement 
        to determine which agent to delegate to.

        You are responsible for delegating tasks to the following agent:
        - worksheet_generator: creates a baseline worksheet for a given grade level
        - variation_generator: generates variations of the baseline worksheet with different types of questions for a grade level.
        - content_simplifier: simplifies the language and content for a given worksheet and adapts it to a grade level.

        After getting the outputs from these agents, it is your task to present them in a structured manner to the user.
        """)
    ),
    instruction=prompt.DIFF_MATERIALS_PROMPT,
    output_key="diff_materials",
    sub_agents=[
        worksheet_generator_agent,
        variation_generator_agent,
        content_simplifier_agent,
    ],
    # tools=[
    #     AgentTool(agent=content_simplifier_agent),
    #     AgentTool(agent=variation_generator_agent),
    # ],
)

root_agent = differentiated_materials_agent
