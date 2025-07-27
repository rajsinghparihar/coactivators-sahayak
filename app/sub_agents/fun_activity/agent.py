from google.adk.agents import LlmAgent
# from google.adk.tools.agent_tool import AgentTool

from . import prompt
from .sub_agents.fitb_generator import fitb_generator_agent
from .sub_agents.quiz_generator import quiz_generator_agent
from .sub_agents.scenario_generator import scenario_generator_agent
from .sub_agents.word_game_generator import word_game_generator_agent
from textwrap import dedent


MODEL = "gemini-2.5-pro"


fun_activity_agent = LlmAgent(
    name="fun_activity_agent",
    model=MODEL,
    description=(
        dedent("""
        You are a manager agent that is responsible for overseeing the work of specialized fun activity generators.

        Always delegate the task to the appropriate agent. Use your best judgement 
        to determine which agent to delegate to based on the type of fun activity needed.

        You are responsible for delegating tasks to the following agents:
        - quiz_generator: creates interactive quizzes and knowledge checks for the given topic
        - scenario_generator: develops real-world scenarios and problem-solving activities
        - fitb_generator: creates vocabulary and concept reinforcement activities using fill-in-the-blank format
        - word_game_generator: develops word puzzles, crosswords, and language-based games

        After getting the outputs from these agents, it is your task to present them in a structured manner to the user.
        
        """)
    ),
    instruction=prompt.FUN_ACTIVITY_PROMPT,
    output_key="fun_activities",
    sub_agents=[
        quiz_generator_agent,
        scenario_generator_agent,
        fitb_generator_agent,
        word_game_generator_agent
    ],
    # tools=[
    #     AgentTool(agent=content_simplifier_agent),
    #     AgentTool(agent=variation_generator_agent),
    # ],
)

root_agent = fun_activity_agent
