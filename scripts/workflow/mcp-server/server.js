#!/usr/bin/env node

/**
 * Workflow MCP Server
 * 
 * Provides tools for workflow agents:
 * - get_current_datetime: Get current date and time
 * - get_system_info: Get workflow system information
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../..');

const server = new Server(
  {
    name: 'workflow-tools',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_current_datetime',
      description: 'Get current date and time in various formats (ISO, date only, time only, timestamp)',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['iso', 'date', 'time', 'timestamp', 'all'],
            default: 'all',
            description: 'Format to return: iso (ISO 8601), date (YYYY-MM-DD), time (HH:MM:SS), timestamp (Unix ms), or all'
          },
          timezone: {
            type: 'string',
            default: 'UTC',
            description: 'Timezone (e.g., UTC, America/New_York). Default: UTC'
          }
        }
      }
    },
    {
      name: 'get_system_info',
      description: 'Get workflow system information including current date/time and workflow version',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_current_datetime') {
    const now = new Date();
    const format = args?.format || 'all';
    const timezone = args?.timezone || 'UTC';
    
    // For simplicity, we'll use UTC. For full timezone support, you'd need a library like date-fns-tz
    const result = {};
    
    if (format === 'all' || format === 'date') {
      result.date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    if (format === 'all' || format === 'time') {
      result.time = now.toISOString().split('T')[1].split('.')[0] + 'Z'; // HH:MM:SSZ
    }
    if (format === 'all' || format === 'iso') {
      result.iso = now.toISOString();
    }
    if (format === 'all' || format === 'timestamp') {
      result.timestamp = now.getTime();
    }
    
    result.timezone = timezone;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  if (name === 'get_system_info') {
    try {
      // Read workflow version
      const versionPath = join(PROJECT_ROOT, '.workflow', 'VERSION.md');
      const versionContent = await readFile(versionPath, 'utf-8');
      const versionMatch = versionContent.match(/Current Version.*?(\d+\.\d+\.\d+)/);
      
      const now = new Date();
      const info = {
        currentDate: now.toISOString().split('T')[0],
        currentTime: now.toISOString().split('T')[1].split('.')[0] + 'Z',
        iso: now.toISOString(),
        timestamp: now.getTime(),
        workflowVersion: versionMatch?.[1] || 'unknown',
        timezone: 'UTC'
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(info, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to read system info',
              message: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr (stdio transport uses stdout for protocol)
  console.error('Workflow Tools MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in MCP server:', error);
  process.exit(1);
});

