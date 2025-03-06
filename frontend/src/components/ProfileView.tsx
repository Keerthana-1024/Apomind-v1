
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProfileView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSave = () => {
    // Validate
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    // Update user
    updateUser({
      name: formData.name,
    });
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
    
    setEditing(false);
  };
  
  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setEditing(false);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gradient">Profile</h2>
        <p className="text-sm text-gray-500">Manage your personal information</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6 flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg mb-4">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-r from-apomind-blue to-apomind-indigo text-white text-2xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        
        <Card className="glass-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            {!editing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`pl-10 bg-white/80 ${editing ? "" : "opacity-70"}`}
                  placeholder="Your full name"
                  readOnly={!editing}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  className="pl-10 bg-white/80 opacity-70"
                  placeholder="Your email address"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            {editing && (
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center"
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  className="bg-gradient-to-r from-apomind-blue to-apomind-indigo text-white flex items-center"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="glass-card p-6 mb-6">
          <h3 className="text-lg font-medium mb-2">Learning Progress</h3>
          <p className="text-gray-600 text-sm mb-4">Your course completion and study statistics</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-apomind-blue">4</div>
              <div className="text-sm text-gray-600">Courses In Progress</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-apomind-purple">2</div>
              <div className="text-sm text-gray-600">Courses Completed</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-apomind-indigo">24</div>
              <div className="text-sm text-gray-600">Learning Hours</div>
            </div>
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-500">85%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </Card>
        
        <Card className="glass-card p-6">
          <h3 className="text-lg font-medium mb-2">Account Settings</h3>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Notification Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileView;
