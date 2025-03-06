
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare, Calendar, Clock } from "lucide-react";

// Sample chat history data
const CHAT_HISTORY = [
  {
    id: "1",
    title: "Calculus Derivatives Help",
    preview: "I need help understanding the chain rule for derivatives...",
    date: "2023-09-10T14:30:00",
    messages: 8
  },
  {
    id: "2",
    title: "Programming Assignment Questions",
    preview: "How do I implement a binary search tree in Python?",
    date: "2023-09-08T09:15:00",
    messages: 12
  },
  {
    id: "3",
    title: "Electromagnetic Theory",
    preview: "Can you explain Maxwell's equations in simple terms?",
    date: "2023-09-05T16:45:00",
    messages: 15
  },
  {
    id: "4",
    title: "Circuit Analysis Problems",
    preview: "I'm having trouble with this RC circuit problem...",
    date: "2023-09-01T11:20:00",
    messages: 9
  },
  {
    id: "5",
    title: "Data Structures Concepts",
    preview: "What's the difference between a stack and a queue?",
    date: "2023-08-28T13:50:00",
    messages: 6
  }
];

const ChatHistory: React.FC = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gradient">Chat History</h2>
        <p className="text-sm text-gray-500">Review your previous conversations</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {CHAT_HISTORY.map((chat) => (
          <Card key={chat.id} className="glass-card p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{chat.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{chat.preview}</p>
                
                <div className="flex items-center mt-3 text-xs text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(chat.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatTime(chat.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>{chat.messages} messages</span>
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
