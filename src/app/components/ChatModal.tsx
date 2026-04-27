import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  ownerName: string;
  objectName: string;
  chatId: string;
}

export function ChatModal({ isOpen, onClose, currentUser, ownerName, objectName, chatId }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(localStorage.getItem(`edurent_chat_${chatId}`) || "[]");
      setMessages(stored);
    }
  }, [isOpen, chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !currentUser) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem(`edurent_chat_${chatId}`, JSON.stringify(updated));
    setInputText("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Chat with {ownerName}
          </DialogTitle>
          <p className="text-sm text-gray-500">Regarding: {objectName}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4 min-h-[300px] max-h-[400px]">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-8">
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender === currentUser;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-semibold text-purple-600 mb-1">{msg.sender}</p>
                  )}
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${isMe ? "text-purple-200" : "text-gray-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" className="bg-purple-600 hover:bg-purple-700">
            <Send className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
