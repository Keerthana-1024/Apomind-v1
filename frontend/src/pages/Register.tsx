
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { register, loading } = useAuth();

  const validate = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      try {
        // Prepare the data as a JSON object
        const userData = {
          name: name,
          email: email,
          password: password,
        };

        // Send the data using fetch
        const response = await fetch("http://localhost:8000/auth/register", { // Replace with your API endpoint
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          // Handle error responses
          const errorData = await response.json();
          console.error("Registration failed:", errorData);
          // Optionally, display error messages to the user
          return;
        }

        // If the request is successful, you might want to handle the response
        const data = await response.json();
        console.log("Registration successful:", data);

        // Call your register function from AuthContext if needed
        await register(name, email, password);

      } catch (error) {
        console.error("Registration failed:", error);
        // Handle network errors or other exceptions
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
      {/* Floating background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-200/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* Back to home */}
      <Link to="/" className="fixed top-8 left-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-apomind-indigo" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
          <p className="text-gray-600">Join Apomind and start your AI-powered learning journey</p>
        </div>
        
        <Card className="glass-card p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5" encType="application/x-www-form-urlencoded">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Full Name ---- changed------</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-red-500' : 'border-gray-200'} bg-white/80`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : 'border-gray-200'} bg-white/80`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 ${errors.password ? 'border-red-500' : 'border-gray-200'} bg-white/80`}
                  placeholder="******"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} bg-white/80`}
                  placeholder="******"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <Button 
              type="submit" 
              className="w-full primary-button mt-2" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-apomind-blue hover:text-apomind-indigo font-medium">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
