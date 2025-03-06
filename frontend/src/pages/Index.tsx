import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Book, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col">
      {/* Floating background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-3xl animate-float" 
          // Use animationDelay here
          style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/2 left-2/3 w-80 h-80 bg-purple-200/20 rounded-full filter blur-3xl animate-float" 
          // Use animationDelay here
          style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Navigation */}
      <header className="glass border-b border-white/20 py-4">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-apomind-blue mr-2" />
            <h1 className="text-xl font-bold text-gradient">Apomind</h1>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate('/login')}>Log in</Button>
            <Button className="primary-button" onClick={() => navigate('/register')}>Sign up</Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient leading-tight">
          AI-Powered Learning<br/>For Engineering Students
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mb-10">
          Apomind uses AI to personalize your learning journey, recommend courses, and help you master complex engineering concepts through interactive conversations.
        </p>
        <Button 
          size="lg" 
          className="primary-button group text-lg px-8 py-6 h-auto"
          onClick={() => navigate('/register')}
        >
          <span>Get Started for Free</span>
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </section>
      
      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gradient">How Apomind Helps You Learn</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Book className="text-apomind-blue h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Learning Path</h3>
            <p className="text-gray-600">
              Based on your interests, prior knowledge, and learning style, we create a customized curriculum just for you.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="text-apomind-indigo h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Chat Assistant</h3>
            <p className="text-gray-600">
              Ask questions anytime and get intelligent, contextual responses that help you understand complex engineering concepts.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-purple-600 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">
              Monitor your learning journey with detailed analytics and actionable insights to help you improve continuously.
            </p>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="glass-card p-10 rounded-2xl max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gradient">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Join thousands of engineering students who are using Apomind to master complex subjects and accelerate their academic journey.
          </p>
          <Button 
            size="lg"
            className="primary-button group"
            onClick={() => navigate('/register')}
          >
            <span>Create Your Account</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2023 Apomind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
