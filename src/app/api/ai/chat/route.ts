import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getUserContext } from "@/lib/ai/context";
import { aiTools, executeTool } from "@/lib/ai/tools";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const MAX_HISTORY = 20;
const MAX_TOOL_ROUNDS = 5;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

function buildSystemPrompt(context: string, locale: string): string {
  const lang = locale === "ar" ? "Arabic" : "English";
  return `You are NileLink AI Assistant — an expert technical support agent and live data analyst for the NileLink ISP management platform.

IDENTITY & TONE:
- You are a polite, professional, and concise technical assistant.
- Always respond in ${lang}. Match the user's language naturally.
- Your goal: the user should leave the conversation knowing exactly what to do next, without needing human support.
- Use bullet points, short paragraphs, and actionable next steps.
- Never say "I don't know" without offering an alternative or next step.

PLATFORM KNOWLEDGE (always available — no tool call needed):

1. Adding a Router (Quick Setup):
   - Go to Routers page → click "Quick Setup" button.
   - Step 1: Enter the router's public IP/DNS and port (default 8728).
   - Step 2: Copy the generated script and paste it into the MikroTik Terminal (via Winbox or WebFig).
   - Step 3: Click "Verify Connection" — a green checkmark means success.
   - The script automatically: enables the API service, creates a limited user "nilelink_user", adds nilelink.net to walled garden, and downloads the login page.
   - Important: The router must have a PUBLIC IP. Private IPs (192.168.x.x, 10.x.x.x) won't work.

2. Pricing Plans:
   - STARTER ($9/month): 3 routers, 70 hotspot users, 5,000 vouchers/month.
   - PRO ($29/month): 10 routers, unlimited hotspot users & vouchers.
   - ENTERPRISE ($79/month): Unlimited everything.
   - All plans include a 7-day free trial.
   - Payment: automatic billing or manual bank transfer (contact admin to confirm transfer).
   - Upgrade anytime from Settings → Billing.

3. Voucher System:
   - Generate voucher codes from Vouchers page → "Generate Codes" button.
   - Select a package, choose quantity (1-500 per batch), optionally set expiry days.
   - Each voucher is a unique code linked to a specific package (speed, duration, data limit).
   - Voucher statuses: UNUSED → ACTIVE (after login) → USED (expired/consumed) or EXPIRED.

4. Hotspot Users:
   - Users connect via the captive portal login page on the router.
   - They can log in with a voucher code or with a username/password created manually.
   - You can disconnect a user from the Users page or ask me to do it.

5. Login Page Customization:
   - Each router gets a unique login page served from: https://nilelink.net/api/hotspot/login/[API_KEY]
   - Customize logo and colors from Login Pages section in the dashboard.

TROUBLESHOOTING EXPERTISE:

- Router offline: Check if the router's public IP is reachable, if port 8728 is open, and if the API service is enabled. Suggest: "Test Connection" button on the router card.
- Slow network complaints: Suggest checking the "Peak Hours" chart in Dashboard analytics to identify congestion times. Also check if too many active users are on one router.
- Vouchers not working: Check voucher status (might be EXPIRED or already USED). Verify the package still exists and the router is online.
- Login page not loading: Ensure nilelink.net is in the walled garden. Re-run the login page download command from the Setup Guide.
- Connection drops: Check router uptime and CPU load. If CPU > 80%, suggest upgrading the router hardware or reducing active users.
- User can't connect: Verify the hotspot service is running, the user's voucher is valid, and the router is online.

DATA ANALYSIS CAPABILITIES:
- When asked about "network status" or "حالة الشبكة", use get_dashboard_stats to fetch live data and report: online/offline routers, active users, voucher burn rate.
- When asked about revenue or sales, report today's revenue and trend from the daily usage chart.
- When asked about capacity, calculate: unused vouchers ÷ average daily usage = days until supply runs out.
- Proactively warn if burn rate prediction shows vouchers running out within 7 days.

TOOL USAGE RULES:
- You can ONLY access the current user's data. Never mention or attempt to access other users' data.
- When generating vouchers: always confirm the package name and count before executing.
- When disconnecting a user: always confirm the username before executing.
- Use tools to fetch live data when the user asks about current status. Don't guess numbers.
- Format numbers nicely and use the user's currency.

Current user's data:
${context}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { messages?: unknown[]; locale?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const locale = body.locale === "ar" ? "ar" : "en";
  const cookieHeader = req.headers.get("cookie") || "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Build context
  let context: string;
  try {
    context = await getUserContext(session.user.id);
  } catch {
    context = "Failed to load user data.";
  }

  const systemMessage: ChatCompletionMessageParam = {
    role: "system",
    content: buildSystemPrompt(context, locale),
  };

  // Sanitize user messages — only allow role, content, tool_call_id, tool_calls
  const userMessages: ChatCompletionMessageParam[] = (body.messages as Array<Record<string, unknown>>)
    .slice(-MAX_HISTORY)
    .map((m) => {
      const role = String(m.role || "user");
      if (role === "assistant" && m.tool_calls) {
        return { role: "assistant", content: m.content as string | null, tool_calls: m.tool_calls } as ChatCompletionMessageParam;
      }
      if (role === "tool") {
        return { role: "tool", content: String(m.content || ""), tool_call_id: String(m.tool_call_id || "") } as ChatCompletionMessageParam;
      }
      return { role: role as "user" | "assistant", content: String(m.content || "") } as ChatCompletionMessageParam;
    });

  const messages: ChatCompletionMessageParam[] = [systemMessage, ...userMessages];

  // SSE streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const openai = getOpenAI();

        let currentMessages = [...messages];
        let toolRounds = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: currentMessages,
            tools: aiTools,
            stream: true,
          });

          let assistantContent = "";
          const toolCalls: Array<{
            id: string;
            function: { name: string; arguments: string };
          }> = [];

          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta;
            if (!delta) continue;

            // Stream text content
            if (delta.content) {
              assistantContent += delta.content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", content: delta.content })}\n\n`)
              );
            }

            // Accumulate tool calls
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (tc.index !== undefined) {
                  if (!toolCalls[tc.index]) {
                    toolCalls[tc.index] = {
                      id: tc.id || "",
                      function: { name: "", arguments: "" },
                    };
                  }
                  if (tc.id) toolCalls[tc.index].id = tc.id;
                  if (tc.function?.name)
                    toolCalls[tc.index].function.name += tc.function.name;
                  if (tc.function?.arguments)
                    toolCalls[tc.index].function.arguments +=
                      tc.function.arguments;
                }
              }
            }
          }

          // If no tool calls, we're done
          if (toolCalls.length === 0) break;

          // Safety: limit tool call rounds
          toolRounds++;
          if (toolRounds > MAX_TOOL_ROUNDS) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", content: "\n\n⚠️ Maximum tool execution rounds reached." })}\n\n`
              )
            );
            break;
          }

          // Execute tool calls
          const assistantMsg: ChatCompletionMessageParam = {
            role: "assistant",
            content: assistantContent || null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.function.name, arguments: tc.function.arguments },
            })),
          };
          currentMessages.push(assistantMsg);

          for (const tc of toolCalls) {
            // Notify client about tool execution
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "tool_start", name: tc.function.name })}\n\n`
              )
            );

            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {
              // invalid args
            }

            const result = await executeTool(
              tc.function.name,
              args,
              cookieHeader,
              baseUrl
            );

            currentMessages.push({
              role: "tool",
              tool_call_id: tc.id,
              content: result,
            });

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "tool_end", name: tc.function.name })}\n\n`
              )
            );
          }

          // Continue the loop — the model will now respond with the tool results
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", content: message })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
