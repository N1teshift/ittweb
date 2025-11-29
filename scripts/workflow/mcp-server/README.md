# Workflow MCP Server

MCP server that provides current date/time and system information to workflow agents.

## Installation

```bash
cd scripts/workflow/mcp-server
npm install
```

## Available Tools

### `get_current_datetime`

Get current date and time in various formats.

**Parameters:**
- `format` (optional): `'iso' | 'date' | 'time' | 'timestamp' | 'all'` (default: `'all'`)
- `timezone` (optional): Timezone string (default: `'UTC'`)

**Returns:**
```json
{
  "date": "2025-01-29",
  "time": "14:30:00Z",
  "iso": "2025-01-29T14:30:00.000Z",
  "timestamp": 1738167000000,
  "timezone": "UTC"
}
```

### `get_system_info`

Get workflow system information including current date/time and workflow version.

**Returns:**
```json
{
  "currentDate": "2025-01-29",
  "currentTime": "14:30:00Z",
  "iso": "2025-01-29T14:30:00.000Z",
  "timestamp": 1738167000000,
  "workflowVersion": "3.1.2",
  "timezone": "UTC"
}
```

## Cursor Configuration

Add to Cursor settings (Settings → Features → Model Context Protocol):

```json
{
  "mcpServers": {
    "workflow-tools": {
      "command": "node",
      "args": ["scripts/workflow/mcp-server/server.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

## Testing

Test the server manually:

```bash
cd scripts/workflow/mcp-server
node server.js
```

Then send MCP protocol messages via stdin (or use MCP Inspector).

## MCP Inspector

Debug the server using MCP Inspector:

```bash
npm install -g @modelcontextprotocol/inspector
npx @modelcontextprotocol/inspector node scripts/workflow/mcp-server/server.js
```

