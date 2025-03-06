
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import ChatBot from "@/components/ChatBot";
import ChatHistory from "@/components/ChatHistory";
import ProfileView from "@/components/ProfileView";

const Home = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Floating background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-72px)]">
        <div className="h-full glass-card rounded-xl overflow-hidden animate-fade-in">
          {activeTab === "chat" && <ChatBot />}
          {activeTab === "history" && <ChatHistory />}
          {activeTab === "profile" && <ProfileView />}
        </div>
      </main>
    </div>
  );
};

export default Home;
