import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface AIChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatWidget({ isOpen, onClose }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm Rentify AI Assistant. How can I help you today? 😊",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const quickReplies = [
    "How do I rent an object?",
    "What are the payment methods?",
    "Can I cancel my booking?",
    "How do I add my object?",
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("rent") || lowerMessage.includes("how")) {
      return "To rent an object: 1) Browse our catalog 2) Click 'View Details' on any item 3) Contact the owner using the provided phone number 4) Scan the QR code to make payment 5) Coordinate pickup with the owner. Simple! 🎉";
    } else if (lowerMessage.includes("payment") || lowerMessage.includes("pay")) {
      return "We accept payments via UPI. Simply scan the QR code shown in the object details page with any UPI app (Google Pay, PhonePe, Paytm, etc.). Payment is secure and instant! 💳";
    } else if (lowerMessage.includes("cancel") || lowerMessage.includes("refund")) {
      return "You can cancel your booking 24 hours before pickup with no charges. Within 24 hours, a 50% cancellation fee applies. Refunds are processed in 5-7 business days. 📅";
    } else if (lowerMessage.includes("add") || lowerMessage.includes("owner")) {
      return "To list your object: 1) Click the '+ Add Object' button in the header 2) Fill in object details and your contact info 3) Set your rental price 4) Submit! Your listing will be live immediately. 📦";
    } else if (lowerMessage.includes("rules") || lowerMessage.includes("regulation")) {
      return "Please click on 'Rules & Regulations' in the header to view all rental terms. Key points: Valid ID required, security deposit may apply, return on time to avoid extra charges. ⚖️";
    } else if (lowerMessage.includes("contact") || lowerMessage.includes("support")) {
      return "You can reach us at support@rentify.com or call 1800-123-4567. We're here to help! 📞";
    } else if (lowerMessage.includes("location") || lowerMessage.includes("pickup")) {
      return "Each object has a Google Maps location showing the owner's pickup address. Click 'View Details' to see the exact location and coordinate with the owner. 📍";
    } else {
      return "I understand you're asking about: \"" + userMessage + "\". For specific queries, please contact our support at support@rentify.com or browse our Rules & Regulations section. Is there anything else I can help with? 🤔";
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-4 right-4 z-50 w-96 shadow-2xl"
    >
      <Card className="border-2 border-purple-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="size-6" />
            <div>
              <h3 className="font-semibold">Rentify AI Assistant</h3>
              <p className="text-xs text-purple-100">Online • Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Messages */}
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.sender === "bot" && (
                      <div className="bg-purple-100 rounded-full p-2 h-fit">
                        <Bot className="size-4 text-purple-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user" ? "text-purple-100" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="bg-purple-600 rounded-full p-2 h-fit">
                        <User className="size-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          <div className="px-4 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
