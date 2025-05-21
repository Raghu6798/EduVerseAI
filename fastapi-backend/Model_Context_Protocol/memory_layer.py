import sys
import os
import asyncio

# Add the root folder to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config
from mcp.server import FastMCP

mcp_server = FastMCP()

@mcp_server.tool()

