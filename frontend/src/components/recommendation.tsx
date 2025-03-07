import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Recommend = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.username) return;
      try {
        const response = await axios.get(
          `http://localhost:8000/career_recommendation?username=${user.username}`
        );
        setRecommendations(response.data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to fetch recommendations.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-white to-gray-50 p-10">
      <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center tracking-tight">
        Top Career Recommendations
      </h2>
      {loading ? (
        <div className="flex items-center justify-center mt-10">
          <Loader2 className="animate-spin text-gray-600 h-16 w-16" />
        </div>
      ) : error ? (
        <p className="text-red-500 font-medium text-lg bg-red-100 px-4 py-2 rounded-lg">
          {error}
        </p>
      ) : recommendations.length === 0 ? (
        <p className="text-gray-500 font-medium text-lg">
          No recommendations available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl mt-6">
          {recommendations.map((career, index) => (
            <Card
              key={index}
              className="p-6 shadow-lg rounded-xl bg-gradient-to-br from-white to-gray-50 text-center transition-transform transform hover:scale-105 hover:shadow-xl border border-gray-200 w-full h-48 flex flex-col justify-center items-center"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {career.career_name}
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Explore opportunities in this field.
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommend;