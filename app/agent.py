# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from datetime import datetime, timezone

import google.genai.types as genai_types
from google.adk.agents import LlmAgent
from google.adk.planners import BuiltInPlanner

from app.config import config

from . import prompt
from .sub_agents.differentiated_materials import differentiated_materials_agent
from .sub_agents.hyper_local_content_agent import hyper_local_content_agent
from .sub_agents.knowledge_base_agent import knowledge_base_agent
from .sub_agents.visual_aid_agent import visual_aid_agent
from .sub_agents.fun_activity import fun_activity_agent
from .sub_agents.planning import lesson_planning_agent


# --- ROOT AGENT DEFINITION ---
root_agent = LlmAgent(
    name=config.internal_agent_name,
    model=config.model,
    description="An intelligent agent that takes goals and breaks them down into actionable tasks and subtasks with built-in planning capabilities.",
    planner=BuiltInPlanner(
        thinking_config=genai_types.ThinkingConfig(include_thoughts=True)
    ),
    instruction=prompt.SAHAYAK_PROMPT.format(
        cur_date=datetime.now(timezone.utc).strftime("%Y-%m-%d")
    ),
    sub_agents=[
        differentiated_materials_agent,
        hyper_local_content_agent,
        knowledge_base_agent,
        visual_aid_agent,
        fun_activity_agent,
        lesson_planning_agent,
    ],
    output_key="sahayata",
)
