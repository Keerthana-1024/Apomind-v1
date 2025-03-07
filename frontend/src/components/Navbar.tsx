
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Brain, 
  Menu, 
  X, 
  MessageSquare, 
  History, 
  User as UserIcon,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-apomind-blue" />
            <span className="text-xl font-bold text-gradient">Apomind</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              className={`px-4 py-2 flex items-center space-x-2 ${
                activeTab === "chat" 
                  ? "bg-apomind-blue/10 text-apomind-blue" 
                  : "text-gray-600 hover:text-apomind-blue hover:bg-gray-100/50"
              }`}
              onClick={() => handleTabClick("chat")}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Chat</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`px-4 py-2 flex items-center space-x-2 ${
                activeTab === "history" 
                  ? "bg-apomind-blue/10 text-apomind-blue" 
                  : "text-gray-600 hover:text-apomind-blue hover:bg-gray-100/50"
              }`}
              onClick={() => handleTabClick("history")}
            >
              <History className="h-5 w-5" />
              <span>History</span>
            </Button>
              
            <Button
              variant="ghost"
              className={`px-4 py-2 flex items-center space-x-2 ${
                activeTab === "recommendation" 
                  ? "bg-apomind-blue/10 text-apomind-blue" 
                  : "text-gray-600 hover:text-apomind-blue hover:bg-gray-100/50"
              }`}
              onClick={() => handleTabClick("recommendation")}
            >
              <Brain className="h-5 w-5" />
              <span>Recommendation</span>
            </Button>

            <Button
              variant="ghost"
              className={`px-4 py-2 flex items-center space-x-2 ${
                activeTab === "profile" 
                  ? "bg-apomind-blue/10 text-apomind-blue" 
                  : "text-gray-600 hover:text-apomind-blue hover:bg-gray-100/50"
              }`}
              onClick={() => handleTabClick("profile")}
            >
              <UserIcon className="h-5 w-5" />
              <span>Profile</span>
            </Button>
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0">
                  <Avatar className="h-9 w-9 border-2 border-white">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-apomind-indigo text-white">
                      {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass border-white/20">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleTabClick("profile")}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center cursor-pointer text-red-500 focus:text-red-500"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 animate-slide-down">
            <nav className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className={`px-4 py-3 flex items-center space-x-3 justify-start ${
                  activeTab === "chat" 
                    ? "bg-apomind-blue/10 text-apomind-blue" 
                    : "text-gray-600"
                }`}
                onClick={() => handleTabClick("chat")}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Chat</span>
              </Button>
              
              <Button
                variant="ghost"
                className={`px-4 py-3 flex items-center space-x-3 justify-start ${
                  activeTab === "history" 
                    ? "bg-apomind-blue/10 text-apomind-blue" 
                    : "text-gray-600"
                }`}
                onClick={() => handleTabClick("history")}
              >
                <History className="h-5 w-5" />
                <span>History</span>
              </Button>
              
              <Button
                variant="ghost"
                className={`px-4 py-3 flex items-center space-x-3 justify-start ${
                  activeTab === "profile" 
                    ? "bg-apomind-blue/10 text-apomind-blue" 
                    : "text-gray-600"
                }`}
                onClick={() => handleTabClick("profile")}
              >
                <UserIcon className="h-5 w-5" />
                <span>Profile</span>
              </Button>
              
              <Button
                variant="ghost"
                className="px-4 py-3 flex items-center space-x-3 justify-start text-red-500"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
