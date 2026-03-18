"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Wrench,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ToolStatus {
  name: string;
  status: "running" | "done";
}

export default function AIChatbot() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [toolStatus, setToolStatus] = useState<ToolStatus | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolStatus, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setToolStatus(null);

    // Add empty assistant message for streaming
    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          locale,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: `❌ ${err.error || "Something went wrong"}`,
          };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);
          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "text") {
              setMessages((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                copy[copy.length - 1] = {
                  ...last,
                  content: last.content + event.content,
                };
                return copy;
              });
            } else if (event.type === "tool_start") {
              setToolStatus({ name: event.name, status: "running" });
            } else if (event.type === "tool_end") {
              setToolStatus({ name: event.name, status: "done" });
              setTimeout(() => setToolStatus(null), 800);
            } else if (event.type === "error") {
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: `❌ ${event.content}`,
                };
                return copy;
              });
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `❌ ${t("networkError")}`,
        };
        return copy;
      });
    } finally {
      setStreaming(false);
      setToolStatus(null);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    if (streaming) {
      abortRef.current?.abort();
    }
    setMessages([]);
    setToolStatus(null);
    setStreaming(false);
  }

  const toolNames: Record<string, string> = {
    get_dashboard_stats: t("tools.stats"),
    generate_vouchers: t("tools.generateVouchers"),
    list_hotspot_users: t("tools.listUsers"),
    disconnect_hotspot_user: t("tools.disconnectUser"),
    list_routers: t("tools.listRouters"),
    test_router_connection: t("tools.testRouter"),
    list_packages: t("tools.listPackages"),
    list_vouchers: t("tools.listVouchers"),
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed z-50 bottom-6 p-2.5 rounded-xl shadow-lg transition-all duration-200",
          isAr ? "left-6" : "right-6",
          open
            ? "bg-slate-500 hover:bg-slate-600 scale-90"
            : "bg-primary-600 hover:bg-primary-700 opacity-70 hover:opacity-100"
        )}
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          dir={isAr ? "rtl" : "ltr"}
          className={cn(
            "fixed z-50 bottom-20 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)]",
            "bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden",
            "animate-in slide-in-from-bottom-4 fade-in duration-300",
            isAr ? "left-6" : "right-6"
          )}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t("title")}</h3>
                <p className="text-[10px] text-primary-100">{t("subtitle")}</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-primary-200 hover:text-white hover:bg-white/15 transition-colors"
              title={t("clear")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <Bot className="w-7 h-7 text-primary-500" />
                </div>
                <p className="text-sm font-medium text-slate-700">{t("welcome")}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{t("welcomeHint")}</p>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
                  {[t("suggestion1"), t("suggestion2"), t("suggestion3")].map(
                    (s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(s);
                          inputRef.current?.focus();
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary-600 text-white rounded-ee-md"
                      : "bg-slate-100 text-slate-800 rounded-es-md"
                  )}
                >
                  {msg.content ? (
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  ) : (
                    streaming &&
                    i === messages.length - 1 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Tool execution indicator */}
            {toolStatus && (
              <div className="flex items-center gap-2 text-xs text-slate-500 px-2 py-1.5 bg-amber-50 rounded-lg">
                {toolStatus.status === "running" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                ) : (
                  <Wrench className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>
                  {toolStatus.status === "running"
                    ? `${t("executingTool")} ${toolNames[toolStatus.name] || toolStatus.name}...`
                    : `✓ ${toolNames[toolStatus.name] || toolStatus.name}`}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("placeholder")}
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all disabled:opacity-50 max-h-24 bg-slate-50"
                style={{ minHeight: "40px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className={cn(
                  "p-2.5 rounded-xl transition-all shrink-0",
                  input.trim() && !streaming
                    ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                )}
              >
                {streaming ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <Send className={cn("w-4.5 h-4.5", isAr && "rotate-180")} />
                )}
              </button>
            </div>
            <p className="text-[9px] text-slate-300 text-center mt-1.5">
              {t("poweredBy")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
