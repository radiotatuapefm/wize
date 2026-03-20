import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, AlertTriangle, Sparkles, Package,
  ChevronRight, ArrowLeft,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ChatPage() {
  const { conversationId: convIdParam } = useParams<{ conversationId?: string }>();
  const activeConvId = convIdParam ? Number(convIdParam) : undefined;
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: conversations, isLoading: convsLoading } = trpc.chat.getConversations.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 5000 }
  );

  const { data: messages, isLoading: msgsLoading } = trpc.chat.getMessages.useQuery(
    { conversationId: activeConvId! },
    { enabled: !!activeConvId && isAuthenticated, refetchInterval: 3000 }
  );

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      utils.chat.getMessages.invalidate({ conversationId: activeConvId });
      utils.chat.getConversations.invalidate();
      setMessage("");
      if (data.suggestion) setSuggestion(data.suggestion);
      if (data.flagged) toast.warning("Message flagged for review");
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeConvId) return;
    setSuggestion(null);
    sendMessage.mutate({ conversationId: activeConvId, content: message.trim() });
  };

  const activeConversation = conversations?.find((c) => c.id === activeConvId);

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container py-20 text-center">
        <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Sign in to access messages</h2>
        <Button className="gradient-purple text-white" onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar: conversation list */}
        <div className={`w-full md:w-80 border-r border-border flex flex-col shrink-0 ${activeConvId ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const otherUser = conv.otherUser;
                const product = conv.product;
                const productImages = Array.isArray(product?.images) ? product.images : [];
                return (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/chat/${conv.id}`)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 ${isActive ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                        {otherUser?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{otherUser?.name ?? "Unknown"}</div>
                      {product && (
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Package className="w-3 h-3" /> {product.name}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Start a chat from a product page.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        {activeConvId ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50">
              <button onClick={() => navigate("/chat")} className="md:hidden text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                  {activeConversation?.otherUser?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{activeConversation?.otherUser?.name ?? "Chat"}</div>
                {activeConversation?.product && (
                  <Link href={`/product/${activeConversation.product.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Package className="w-3 h-3" /> {activeConversation.product.name}
                  </Link>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <div className="w-48 h-10 shimmer rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        {msg.moderationFlag && (
                          <div className="flex items-center gap-1 text-xs text-orange-400 mb-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Message flagged for review</span>
                          </div>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-card border border-border text-foreground rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-xs text-muted-foreground px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center py-16">
                  <div className="text-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No messages yet. Say hello!</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* LLM suggestion */}
            <AnimatePresence>
              {suggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-4 mb-2 p-3 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-2"
                >
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary mb-1">AI Suggestion</p>
                    <p className="text-xs text-muted-foreground">{suggestion}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                      onClick={() => { setMessage(suggestion); setSuggestion(null); }}
                    >
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs text-muted-foreground"
                      onClick={() => setSuggestion(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendMessage.isPending}
                className="gradient-purple text-white px-4 glow-purple hover:opacity-90 transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground text-sm">Choose a chat from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
