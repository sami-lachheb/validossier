import asyncio
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
from .prompts import AGENT_SYSTEM_INSTRUCTIONS

_agent_instance = None
_agent_lock = asyncio.Lock()

async def get_agent():
    global _agent_instance
    async with _agent_lock:
        if _agent_instance is None:
            config = LocalAgentConfig(
                system_instructions=AGENT_SYSTEM_INSTRUCTIONS,
                capabilities=CapabilitiesConfig(),
            )
            # Enter the context manager programmatically to keep it alive
            _agent_instance = await Agent(config).__aenter__()
        return _agent_instance

async def close_agent():
    global _agent_instance
    async with _agent_lock:
        if _agent_instance is not None:
            await _agent_instance.__aexit__(None, None, None)
            _agent_instance = None
