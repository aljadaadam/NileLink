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
  return `You are NileLink AI Assistant — a helpful, concise assistant embedded inside the NileLink ISP management dashboard.

Your role:
- Help the user manage their MikroTik routers, hotspot users, vouchers, and packages.
- Answer questions about their dashboard data.
- Execute actions (generate vouchers, disconnect users, test routers, etc.) when asked.
- Provide short, actionable responses. Avoid long explanations unless asked.

Rules:
- Always respond in ${lang}.
- You can ONLY access the current user's data. Never mention or attempt to access other users' data.
- When generating vouchers, always confirm the package name and count before executing.
- When disconnecting a user, always confirm the username before executing.
- If you don't know something, say so. Don't make up data.
- Format numbers nicely and use the user's currency.
- Keep responses concise — use bullet points and short paragraphs.

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
