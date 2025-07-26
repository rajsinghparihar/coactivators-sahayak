from google.adk.agents import LlmAgent
# from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .sub_agents.mindmap_generator import mindmap_generator_agent
from .sub_agents.diagram_creator import diagram_creator_agent
from .sub_agents.visual_guide_generator import visual_guide_generator_agent
from textwrap import dedent


MODEL = "gemini-2.5-flash"


visual_aid_agent = LlmAgent(
    name="visual_aid_agent",
    model=MODEL,
    description=(
        dedent("""
        You are a manager agent responsible for creating visual learning aids for teachers.
        
        Always delegate tasks to the appropriate specialized agent based on the teacher's request.
        Use your best judgement to determine which agent to delegate to:

        - mindmap_generator: Creates conceptual mindmaps and knowledge maps showing relationships between ideas
        - diagram_creator: Generates educational diagrams, flowcharts, process diagrams, and visual representations  
        - visual_guide_generator: Creates step-by-step visual learning guides and instructional graphics

        Your workflow:
        1. Ask the teacher for their grade level (K-12 or age range)
        2. Understand the educational topic or concept they want visualized
        3. Determine the most appropriate type of visual aid needed
        4. Delegate to the appropriate sub-agent(s)
        5. Present the visual aids in a structured, teacher-friendly format

        After getting outputs from these agents, present them in a clear, organized manner that teachers can easily use in their classrooms.
        """)
    ),
    instruction=prompt.VISUAL_AID_GENERATOR_PROMPT,
    output_key="visual_aid_output",
    sub_agents=[
        mindmap_generator_agent,
        diagram_creator_agent,
        visual_guide_generator_agent,
    ],
    # tools=[
    #     AgentTool(agent=mindmap_generator_agent),
    #     AgentTool(agent=diagram_creator_agent),
    #     AgentTool(agent=visual_guide_generator_agent),
    # ],
)

root_agent = visual_aid_agent