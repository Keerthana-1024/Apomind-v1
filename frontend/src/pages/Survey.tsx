
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import SurveyQuestion from "@/components/SurveyQuestion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

// Mock data for courses
const courses = [
  { id: 1, name: "Calculus", prerequisites: null },
  { id: 2, name: "Engineering Electromagnetics", prerequisites: null },
  { id: 3, name: "Electrical Circuits for Engineers", prerequisites: null },
  { id: 4, name: "Problem Solving and Programming", prerequisites: null },
  { id: 5, name: "Materials for Engineers", prerequisites: null },
  { id: 6, name: "Foundation for Engineering and Product Design", prerequisites: null },
  { id: 7, name: "Engineering Electromagnetics Practice", prerequisites: null },
  { id: 8, name: "Problem Solving and Programming Practice", prerequisites: null },
  { id: 9, name: "Effective Language and Communication Skills", prerequisites: null },
  { id: 10, name: "Differential Equations", prerequisites: null },
  { id: 11, name: "Data Structures and Algorithms", prerequisites: "Problem Solving and Programming" },
  { id: 12, name: "Discrete Structures for Computer Science", prerequisites: null },
  { id: 13, name: "Engineering Graphics", prerequisites: null },
  { id: 14, name: "Design and Manufacturing Lab", prerequisites: null },
  { id: 15, name: "Data Structures and Algorithms Practice", prerequisites: null },
  { id: 16, name: "Sociology of Design", prerequisites: "Foundation for Engineering and Product Design" },
  { id: 17, name: "Systems Thinking for Design", prerequisites: "Sociology of Design" },
  { id: 18, name: "Object-Oriented Programming", prerequisites: null },
  { id: 19, name: "Digital System Design", prerequisites: null },
  { id: 20, name: "Design and Analysis of Algorithms", prerequisites: "Data Structures and Algorithms" },
];

// Define survey questions
const surveyQuestions = [
  {
    id: "q1",
    question: "What is your current education level?",
    options: [
      { id: "q1_o1", text: "High School" },
      { id: "q1_o2", text: "Bachelor's" },
      { id: "q1_o3", text: "Master's" },
      { id: "q1_o4", text: "Ph.D." },
    ],
  },
  {
    id: "q2",
    question: "Which field of engineering are you most interested in?",
    options: [
      { id: "q2_o1", text: "Computer Science" },
      { id: "q2_o2", text: "Electrical Engineering" },
      { id: "q2_o3", text: "Mechanical Engineering" },
      { id: "q2_o4", text: "Civil Engineering" },
    ],
  },
  {
    id: "q3",
    question: "How much programming experience do you have?",
    options: [
      { id: "q3_o1", text: "None" },
      { id: "q3_o2", text: "Beginner" },
      { id: "q3_o3", text: "Intermediate" },
      { id: "q3_o4", text: "Advanced" },
    ],
  },
  {
    id: "q4",
    question: "What is your preferred learning style?",
    options: [
      { id: "q4_o1", text: "Visual (images, videos)" },
      { id: "q4_o2", text: "Auditory (lectures, discussions)" },
      { id: "q4_o3", text: "Reading/Writing" },
      { id: "q4_o4", text: "Kinesthetic (hands-on practice)" },
    ],
  },
  {
    id: "q5",
    question: "Which courses have you already completed?",
    options: courses.slice(0, 4).map(course => ({
      id: `course_${course.id}`,
      text: course.name
    })),
  },
];

const Survey = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Calculate progress
    const newProgress = ((currentStep + 1) / surveyQuestions.length) * 100;
    setProgress(newProgress);
  }, [currentStep]);

  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const goToNextQuestion = () => {
    if (currentStep < surveyQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate submitting survey data to a backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user profile to indicate survey is completed
      updateUser({ completedSurvey: true });
      
      toast({
        title: "Survey Completed",
        description: "Your preferences have been saved. Welcome to Apomind!",
      });
      
      // Navigate to home
      navigate("/home");
    } catch (error) {
      console.error("Failed to submit survey:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = surveyQuestions[currentStep];
  const isLastQuestion = currentStep === surveyQuestions.length - 1;
  const canProceed = answers[currentQuestion.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col">
      {/* Floating background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* Header */}
      <header className="glass border-b border-white/20 py-4">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-apomind-blue mr-2" />
            <h1 className="text-xl font-bold text-gradient">Apomind</h1>
          </div>
          <div className="text-sm text-gray-600">Step {currentStep + 1} of {surveyQuestions.length}</div>
        </div>
      </header>
      
      {/* Progress bar */}
      <div className="container mx-auto px-4 sm:px-6 py-2">
        <Progress value={progress} className="h-1 bg-gray-200/50" indicatorClassName="bg-gradient-to-r from-apomind-blue to-apomind-indigo" />
      </div>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <Card className="glass-card p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2 text-gradient">Personalize Your Experience</h2>
            <p className="text-gray-600">Let's get to know you better to customize your learning journey</p>
          </div>
          
          <SurveyQuestion
            question={currentQuestion.question}
            options={currentQuestion.options}
            selected={answers[currentQuestion.id] || null}
            onSelect={(id) => handleAnswer(currentQuestion.id, id)}
          />
          
          <div className="mt-10 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            
            {isLastQuestion ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="primary-button flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Complete</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goToNextQuestion}
                disabled={!canProceed}
                className="primary-button flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Survey;
