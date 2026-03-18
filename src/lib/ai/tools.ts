import type { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * Tool definitions for the AI assistant.
 * Each tool maps to an existing NileLink API endpoint.
 */
export const aiTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_dashboard_stats",
      description:
        "Get full dashboard statistics including routers, users, vouchers, revenue charts, peak hours, and burn rate prediction.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_vouchers",
      description:
        "Generate bulk voucher codes for a specific package. Returns the generated codes.",
      parameters: {
        type: "object",
        properties: {
          packageId: {
            type: "string",
            description: "The ID of the package to generate vouchers for.",
          },
          count: {
            type: "number",
            description: "Number of vouchers to generate (1-500).",
          },
          expiryDays: {
            type: "number",
            description:
              "Optional: number of days until the vouchers expire (1-365).",
          },
        },
        required: ["packageId", "count"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_hotspot_users",
      description:
        "List all hotspot users (WiFi clients) with their status, data usage, and associated router.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "disconnect_hotspot_user",
      description:
        "Disconnect a specific hotspot user from the router and deactivate their account.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The ID of the hotspot user to disconnect.",
          },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_routers",
      description:
        "List all MikroTik routers with their connection status, IP address, and device info.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "test_router_connection",
      description: "Test the connection to a specific MikroTik router.",
      parameters: {
        type: "object",
        properties: {
          routerId: {
            type: "string",
            description: "The ID of the router to test.",
          },
        },
        required: ["routerId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_packages",
      description:
        "List all WiFi packages (plans) with their price, speed, and data limits.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_vouchers",
      description:
        "List vouchers with optional status filter. Returns paginated results.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["UNUSED", "ACTIVE", "USED", "EXPIRED"],
            description: "Optional filter by voucher status.",
          },
          page: {
            type: "number",
            description: "Page number for pagination (default: 1).",
          },
        },
        required: [],
      },
    },
  },
];

/**
 * Execute a tool call by proxying to the appropriate internal API.
 * All requests are authenticated with the user's cookie.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  cookieHeader: string,
  baseUrl: string
): Promise<string> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Cookie: cookieHeader,
  };

  try {
    let res: Response;

    switch (name) {
      case "get_dashboard_stats":
        res = await fetch(`${baseUrl}/api/manage-nl7x9k2p/stats`, { headers });
        break;

      case "generate_vouchers":
        res = await fetch(`${baseUrl}/api/vouchers/generate`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            packageId: args.packageId,
            count: args.count,
            expiryDays: args.expiryDays,
          }),
        });
        break;

      case "list_hotspot_users":
        res = await fetch(`${baseUrl}/api/hotspot/users`, { headers });
        break;

      case "disconnect_hotspot_user":
        res = await fetch(
          `${baseUrl}/api/hotspot/users/${args.userId}/disconnect`,
          { method: "POST", headers }
        );
        break;

      case "list_routers":
        res = await fetch(`${baseUrl}/api/routers`, { headers });
        break;

      case "test_router_connection":
        res = await fetch(`${baseUrl}/api/routers/${args.routerId}/test`, {
          method: "POST",
          headers,
        });
        break;

      case "list_packages":
        res = await fetch(`${baseUrl}/api/packages`, { headers });
        break;

      case "list_vouchers": {
        const params = new URLSearchParams();
        if (args.status) params.set("status", String(args.status));
        if (args.page) params.set("page", String(args.page));
        res = await fetch(`${baseUrl}/api/vouchers?${params}`, { headers });
        break;
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }

    const data = await res.json();
    // Truncate large responses to avoid token overflow
    const text = JSON.stringify(data);
    return text.length > 4000 ? text.slice(0, 4000) + "...(truncated)" : text;
  } catch (err) {
    return JSON.stringify({
      error: `Tool execution failed: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}
