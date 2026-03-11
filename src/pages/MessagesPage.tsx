import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ArrowLeft, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  listing_id: string | null;
  updated_at: string;
  other_name: string;
  other_id: string;
  last_message: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean | null;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) {
        toast({ title: "Ошибка загрузки чатов", variant: "destructive" });
        setLoading(false);
        return;
      }

      const convos: Conversation[] = [];
      for (const c of data || []) {
        const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        const [{ data: profile }, { data: lastMsg }] = await Promise.all([
          supabase.from("profiles").select("display_name").eq("user_id", otherId).maybeSingle(),
          supabase.from("messages").select("content").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);
        convos.push({
          ...c,
          other_name: profile?.display_name || "Пользователь",
          other_id: otherId,
          last_message: lastMsg?.content || null,
        });
      }
      setConversations(convos);
      setLoading(false);
    };
    fetchConversations();
  }, [user]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConvo) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConvo)
        .order("created_at", { ascending: true });
      if (!cancelled) setMessages(data || []);

      // Mark unread messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", selectedConvo)
          .neq("sender_id", user.id)
          .eq("read", false);
      }
    };
    fetchMessages();

    const channel = supabase
      .channel(`conversation:${selectedConvo}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConvo}`,
        },
        (payload) => {
          if (!cancelled) {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [selectedConvo]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user || !selectedConvo || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      content,
      conversation_id: selectedConvo,
      sender_id: user.id,
    });

    if (error) {
      toast({ title: "Не удалось отправить", variant: "destructive" });
      setNewMessage(content); // restore
    } else {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConvo);

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvo ? { ...c, last_message: content, updated_at: new Date().toISOString() } : c
        )
      );
    }
    setSending(false);
  }, [newMessage, user, selectedConvo, sending]);

  const selectedConversation = conversations.find((c) => c.id === selectedConvo);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container py-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold mb-4">Сообщения</h1>
      <div className="flex h-[calc(100vh-220px)] md:h-[calc(100vh-160px)] overflow-hidden rounded-xl border bg-card">
        {/* Conversation list */}
        <div className={`w-full border-r md:w-80 ${selectedConvo ? "hidden md:block" : ""}`}>
          <ScrollArea className="h-full">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                У вас пока нет сообщений
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo.id)}
                  className={`flex w-full items-center gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50 ${
                    selectedConvo === convo.id ? "bg-accent" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {convo.other_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm">{convo.other_name}</span>
                    {convo.last_message && (
                      <p className="text-xs text-muted-foreground truncate">{convo.last_message}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(convo.updated_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Messages pane */}
        {selectedConvo ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-3 border-b p-4">
              <button onClick={() => setSelectedConvo(null)} className="md:hidden text-sm text-primary">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Link to={`/user/${selectedConversation?.other_id}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {selectedConversation?.other_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="font-semibold text-sm">{selectedConversation?.other_name}</span>
                  <p className="text-[10px] text-muted-foreground">Нажмите для просмотра профиля</p>
                </div>
              </Link>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">Начните общение — напишите первое сообщение</p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 border-t p-4">
              <Input
                placeholder="Написать сообщение..."
                className="flex-1 rounded-full"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <Button size="icon" className="rounded-full h-10 w-10" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
            Выберите диалог, чтобы начать общение
          </div>
        )}
      </div>
    </div>
  );
}
