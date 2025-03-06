import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

interface Course {
  course_name: string; // ✅ Using course_name instead of ID
}

const Survey = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:8000/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to fetch courses. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchCourses();
  }, []);

  // ✅ Handle course selection (toggle selection)
  const handleCourseSelection = (courseName: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseName) ? prev.filter((name) => name !== courseName) : [...prev, courseName]
    );
  };

  // ✅ Submit selected courses to backend
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:8000/save_selected_courses", {
        user_id: user?.id,
        selected_courses: selectedCourses, // ✅ Sending `course_name`s
      });

      toast({ title: "Survey Completed", description: "Your preferences have been saved." });
      navigate("/home");
    } catch (error) {
      console.error("Failed to submit survey:", error);
      toast({ title: "Submission Failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Card className="p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Select Your Completed Courses</h2>

        <div className="space-y-3">
          {courses.map((course) => (
            <Card
              key={course.course_name}
              className={`border p-4 cursor-pointer flex items-center space-x-3 transition-all duration-200 hover:shadow-md ${
                selectedCourses.includes(course.course_name) ? "border-blue-500 bg-blue-100" : "border-gray-200"
              }`}
              onClick={() => handleCourseSelection(course.course_name)}
            >
              <Checkbox
                checked={selectedCourses.includes(course.course_name)}
                onCheckedChange={() => handleCourseSelection(course.course_name)}
              />
              <span className="text-gray-700">{course.course_name}</span>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button onClick={handleSubmit} disabled={isSubmitting || selectedCourses.length === 0}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Survey;
