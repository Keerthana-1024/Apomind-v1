
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRight, Brain, MessageSquareText, Sparkles } from "lucide-react";

const Index = () => {
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        const opacity = Math.max(1 - scrollPosition / 700, 0);
        const transform = `translateY(${scrollPosition * 0.3}px)`;
        
        heroRef.current.style.opacity = opacity.toString();
        heroRef.current.style.transform = transform;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Staggered animation for features
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            entry.target.classList.add("opacity-100");
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureElements = document.querySelectorAll(".feature-item");
    featureElements.forEach((el, i) => {
      el.classList.add("opacity-0");
      el.style.animationDelay = `${i * 150}ms`;
      observer.observe(el);
    });

    return () => {
      featureElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-apomind-blue" />
            <span className="text-2xl font-bold text-gradient">Apomind</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="secondary-button py-2 px-4">
              Login
            </Link>
            <Link to="/register" className="primary-button py-2 px-4">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-16 section-padding flex flex-col justify-center items-center text-center min-h-screen relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-200/30 animate-pulse-slow -z-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-indigo-200/40 animate-pulse-slow -z-10" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-purple-200/50 animate-pulse-slow -z-10" style={{ animationDelay: '2s' }}></div>
        
        <div className="glass-card p-2 px-4 mb-6 inline-flex items-center space-x-2 animate-fade-in">
          <Sparkles className="h-4 w-4 text-apomind-indigo" />
          <span className="text-sm font-medium">AI-Powered Learning Assistant</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-4xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <span className="text-gradient">Revolutionize</span> Your Learning Experience
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Apomind uses advanced AI to understand your learning style and academic needs, 
          providing personalized guidance and support throughout your educational journey.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Link to="/register" className="primary-button flex items-center justify-center">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link to="/login" className="secondary-button flex items-center justify-center">
            Already Have an Account?
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 section-padding bg-white/50 backdrop-blur-sm border-t border-b border-white/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gradient-pink">Intelligent Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-item glass-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-apomind-blue" />
              </div>
              <h3 className="text-xl font-bold mb-3">Adaptive Learning</h3>
              <p className="text-gray-600">AI-powered system that adapts to your learning style and pace for maximum efficiency.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-item glass-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-6">
                <MessageSquareText className="h-8 w-8 text-apomind-indigo" />
              </div>
              <h3 className="text-xl font-bold mb-3">Intelligent Assistant</h3>
              <p className="text-gray-600">Advanced chatbot that understands complex questions and provides detailed explanations.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-item glass-card p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-apomind-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personalized Path</h3>
              <p className="text-gray-600">Customized course recommendations based on your goals, strengths, and interests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 section-padding text-center">
        <div className="container mx-auto max-w-4xl glass-card p-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already leveraging the power of AI to enhance their educational journey.
          </p>
          <Link to="/register" className="primary-button inline-flex items-center justify-center">
            Create Your Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-white/50 py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-apomind-blue" />
              <span className="text-xl font-bold text-gradient">Apomind</span>
            </div>
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Apomind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
