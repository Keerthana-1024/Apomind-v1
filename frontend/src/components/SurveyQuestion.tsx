
import React from "react";
import { Card } from "@/components/ui/card";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  text: string;
}

interface SurveyQuestionProps {
  question: string;
  options: Option[];
  selected: string | null;
  onSelect: (id: string) => void;
}

const SurveyQuestion: React.FC<SurveyQuestionProps> = ({
  question,
  options,
  selected,
  onSelect,
}) => {
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-medium text-gray-800 mb-4">{question}</h3>
      
      <div className="space-y-3">
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "border p-4 cursor-pointer transition-all duration-200 hover:shadow-md flex items-center space-x-3",
              selected === option.id
                ? "border-apomind-blue bg-blue-50/50"
                : "border-gray-200 bg-white/60"
            )}
            onClick={() => onSelect(option.id)}
          >
            <div 
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center border",
                selected === option.id
                  ? "border-apomind-blue"
                  : "border-gray-300"
              )}
            >
              {selected === option.id && (
                <div className="w-3 h-3 rounded-full bg-apomind-blue" />
              )}
            </div>
            <span className="text-gray-700">{option.text}</span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SurveyQuestion;
