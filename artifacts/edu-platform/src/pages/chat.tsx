import { useState, useRef, useEffect } from "react";
import { Send, Plus, Trash2, MessageCircle, Loader2, Bot, User, Sparkles } from "lucide-react";
import { useListChatConversations, useCreateChatConversation, useGetChatConversation, useDeleteChatConversation } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations, refetch: refetchConvos } = useListChatConversations();
  const { data: activeConv, refetch: refetchConv } = useGetChatConversation(activeConvId ?? 0, {
    query: { enabled: !!activeConvId } as any,
  });
  const createConv = useCreateChatConversation();
  const deleteConv = useDeleteChatConversation();

  const messages: Message[] = activeConvId
    ? (activeConv as any)?.messages?.map((m: any) => ({ role: m.role, content: m.content })) ?? localMessages
    : localMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (activeConvId) {
      setLocalMessages([]);
    }
  }, [activeConvId]);

  const handleNewConv = async () => {
    const conv = await createConv.mutateAsync({ data: { title: "New Chat" } });
    await refetchConvos();
    setActiveConvId(conv.id);
    setLocalMessages([]);
    setStreamingContent("");
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || streaming) return;

    let convId = activeConvId;
    if (!convId) {
      const conv = await createConv.mutateAsync({ data: { title: content.slice(0, 40) } });
      await refetchConvos();
      convId = conv.id;
      setActiveConvId(conv.id);
    }

    setInput("");
    setLocalMessages((prev) => [...prev, { role: "user", content }]);
    setStreaming(true);
    setStreamingContent("");

    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${basePath}/api/chat/conversations/${convId}/messages`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!resp.ok || !resp.body) throw new Error("Request failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.done) break;
            if (json.content) {
              full += json.content;
              setStreamingContent(full);
            }
          } catch { /* ignore */ }
        }
      }

      setLocalMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamingContent("");
      refetchConv();
    } catch (err) {
      setLocalMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I ran into an error. Please try again." }]);
      setStreamingContent("");
    }

    setStreaming(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConv.mutateAsync({ id });
    if (activeConvId === id) {
      setActiveConvId(null);
      setLocalMessages([]);
    }
    refetchConvos();
  };

  const displayMessages = [...messages];
  if (streaming && streamingContent) {
    displayMessages.push({ role: "assistant", content: streamingContent });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-9rem)] flex gap-5">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3">
        <button
          onClick={handleNewConv}
          disabled={createConv.isPending}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm w-full"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {conversations?.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">No conversations yet</p>
          )}
          {conversations?.map((conv: any) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group text-sm transition-colors",
                activeConvId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              )}
            >
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate font-medium">{conv.title || "Chat"}</span>
              <button
                onClick={(e) => handleDelete(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white border rounded-2xl overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">AI Tutor</h2>
            <p className="text-xs text-muted-foreground">Powered by GPT-4o mini · Always ready to help</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {displayMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-semibold text-lg">Ask me anything!</p>
              <p className="text-sm max-w-sm mt-1">I can help you understand coding concepts, debug code, explain algorithms, and more.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-5">
                {["Explain Python lists", "What is a loop?", "Help me debug this code", "What is recursion?"].map((s) => (
                  <button key={s} onClick={() => setInput(s)} className="text-xs border rounded-lg px-3 py-1.5 hover:bg-muted hover:text-primary transition-colors font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            displayMessages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  msg.role === "user" ? "bg-primary text-white" : "bg-gradient-to-br from-primary to-blue-700 text-white"
                )}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                )}>
                  {msg.content}
                  {i === displayMessages.length - 1 && streaming && msg.role === "assistant" && (
                    <span className="inline-block w-1 h-4 ml-0.5 bg-current animate-pulse rounded" />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t bg-muted/20">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streaming}
              placeholder="Ask your AI tutor... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32 overflow-y-auto disabled:opacity-60"
              style={{ minHeight: "42px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 flex-shrink-0"
            >
              {streaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
