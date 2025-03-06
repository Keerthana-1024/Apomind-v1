import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Bot, CheckCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "../context/AuthContext";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  fileUploaded?: boolean;
  fileName?: string;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm Apomind, your AI learning assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() && !file) return;

    setFileUploaded(!!file);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message || `Uploaded a file: ${fileName}`,
      sender: "user",
      timestamp: new Date(),
      fileUploaded: !!file,
      fileName: file ? file.name : ""
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("question", message || "Summarize this document");

        response = await axios.post("http://localhost:8000/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setFile(null);
      } else {
        response = await axios.post("http://localhost:8000/chat", { message });
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.reply,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), content: "Error: Failed to get response", sender: "bot", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black rounded-xl border border-gray-300 shadow-lg">
      <div className="p-4 border-b border-gray-300 flex items-center space-x-2">
        <Bot className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium">Apomind Assistant</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-lg w-full max-w-3xl text-black ${msg.sender === "user" ? "bg-blue-200 self-end" : "bg-gray-200 self-start"}`}>
              <p>{msg.content}</p>
              {msg.fileUploaded && <><CheckCircle className="inline ml-2 text-green-600" /> <span className="text-sm text-gray-600">{msg.fileName}</span></>}
              <span className="block text-xs text-gray-500 mt-1">{msg.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        {isTyping && <p className="text-gray-500">Bot is typing...</p>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-300 flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <input type="file" onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setFileName(e.target.files?.[0]?.name || "");
          }} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer bg-gray-300 text-black px-3 py-2 rounded">Upload</label>
          {fileUploaded && <span className="text-green-600 ml-2">{fileName} uploaded successfully</span>}
        </div>
        <Input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." className="flex-1 bg-gray-100 text-black" />
        <Button type="submit" disabled={!message.trim() && !file} className="bg-blue-500 text-white"><Send className="h-5 w-5" /></Button>
      </form>
    </div>
  );
};

export default ChatBot;
