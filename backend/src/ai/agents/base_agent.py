"""Base agent class using LangGraph."""
from typing import TypedDict
from langgraph.graph import StateGraph, END

from src.utils.logger import logger


class AgentState(TypedDict):
    """Base agent state."""
    messages: list
    # Add your state fields here


class BaseAgent:
    """Base agent class using LangGraph."""

    def __init__(self):
        """Initialize agent."""
        self.logger = logger
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the agent graph."""
        graph = StateGraph(AgentState)

        # Add nodes
        graph.add_node("process", self._process_node)

        # Add edges
        graph.set_entry_point("process")
        graph.add_edge("process", END)

        return graph.compile()

    def _process_node(self, state: AgentState) -> AgentState:
        """Process node implementation."""
        # Add your agent logic here
        return state

    async def run(self, input_data: dict) -> dict:
        """Run the agent."""
        try:
            self.logger.info("Starting agent", agent_name=self.__class__.__name__)
            result = await self.graph.ainvoke(input_data)
            self.logger.info("Agent completed", agent_name=self.__class__.__name__)
            return result
        except Exception as e:
            self.logger.error("Agent failed", agent_name=self.__class__.__name__, error=str(e))
            raise

