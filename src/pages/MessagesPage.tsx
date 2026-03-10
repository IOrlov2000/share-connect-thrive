import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const conversations = [
  { id: "1", name: "Sarah M.", lastMessage: "Is the MacBook still available?", time: "2m ago", unread: true },
  { id: "2", name: "James K.", lastMessage: "Can you do $100 for the jacket?", time: "1h ago", unread: false },
  { id: "3", name: "Maria L.", lastMessage: "I can pick up tomorrow!", time: "3h ago", unread: true },
  { id: "4", name: "David W.", lastMessage: "Thanks for the trade!", time: "1d ago", unread: false },
];

const messages = [
  { id: "1", sender: "them", text: "Hi! Is the MacBook still available?", time: "2:30 PM" },
  { id: "2", sender: "me", text: "Yes it is! Are you interested?", time: "2:32 PM" },
  { id: "3", sender: "them", text: "Absolutely! What condition is it in?", time: "2:33 PM" },
  { id: "4", sender: "me", text: "Like new, only used for 3 months. Comes with original box and charger.", time: "2:35 PM" },
  { id: "5", sender: "them", text: "That sounds great! Can we meet in Brooklyn?", time: "2:36 PM" },
];

export default function MessagesPage() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>("1");

  return (
    <div className="container py-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold mb-4">Messages</h1>
      <div className="flex h-[calc(100vh-220px)] md:h-[calc(100vh-160px)] overflow-hidden rounded-xl border bg-card">
        {/* Conversation List */}
        <div className={`w-full border-r md:w-80 ${selectedConvo ? "hidden md:block" : ""}`}>
          <ScrollArea className="h-full">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo.id)}
                className={`flex w-full items-center gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50 ${
                  selectedConvo === convo.id ? "bg-accent" : ""
                }`}
              >
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {convo.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{convo.name}</span>
                    <span className="text-xs text-muted-foreground">{convo.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                {convo.unread && <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />}
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {selectedConvo ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-3 border-b p-4">
              <button onClick={() => setSelectedConvo(null)} className="md:hidden text-sm text-primary">← Back</button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">S</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">Sarah M.</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        msg.sender === "me"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2 border-t p-4">
              <Input placeholder="Type a message..." className="flex-1 rounded-full" />
              <Button size="icon" className="rounded-full h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
