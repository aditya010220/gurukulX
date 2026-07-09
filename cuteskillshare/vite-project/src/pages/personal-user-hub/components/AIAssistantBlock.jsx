"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Bot, Send, Calendar, Upload, BookOpen, Code, Palette, Brain, CheckCircle } from "lucide-react"
import Input from "../../../components/ui/Input"

const suggestedResources = [
  { icon: BookOpen, label: "React Patterns", color: "bg-lavender/30", url: "https://www.geeksforgeeks.org/reactjs-design-patterns/" },
  { icon: Code, label: "TypeScript Guide", color: "bg-mint/30", url: "https://www.geeksforgeeks.org/typescript-tutorials/" },
  { icon: Palette, label: "Design Systems", color: "bg-peach/30", url: "https://www.geeksforgeeks.org/introduction-to-design-systems/" },
  { icon: Brain, label: "System Design", color: "bg-soft-blue/30", url: "https://www.geeksforgeeks.org/system-design-tutorial/" },
]

export function AIAssistantPanel() {
  const [query, setQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleSend = () => {
    if (selectedFile) {
      navigate('/assistant', {
        state: {
          initialQuery: `I have uploaded my assignment: ${selectedFile.name}. Please review it and provide feedback.`,
          type: 'assignment',
          fileName: selectedFile.name
        }
      });
    } else if (query.trim()) {
      navigate('/assistant', {
        state: {
          initialQuery: query
        }
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setQuery(`Selected assignment: ${file.name}. Press Enter to submit.`);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate7DayPlan = () => {
    navigate('/assistant', {
      state: {
        initialQuery: "Generate a 7-day learning plan for me (use the Socratic method: ask me a few questions about my current skill level and goals first)"
      }
    });
  };

  const handleResourceClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-card rounded-[2rem] border border-charcoal/5 p-6 md:p-8 shadow-sm animate-slide-in-up stagger-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-lavender/40 flex items-center justify-center">
          <Bot className="w-5 h-5 text-charcoal/70" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-charcoal">AI Learning Assistant</h2>
          <p className="text-xs text-charcoal/50">Powered by AI to accelerate your learning</p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.js,.ts,.tsx"
      />

      {/* Ask AI Input */}
      <div className="relative mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedFile ? "Press Enter to submit your assignment..." : "Ask anything about your learning path..."}
          className="h-12 pl-4 pr-12 bg-warm-white border-charcoal/5 rounded-2xl text-sm placeholder:text-charcoal/40 focus:shadow-lg focus:shadow-lavender/20 focus:border-lavender"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!query.trim() && !selectedFile}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-charcoal text-white rounded-xl flex items-center justify-center hover:bg-charcoal/90 transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="sr-only">Send message</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <button
          type="button"
          onClick={handleGenerate7DayPlan}
          className="flex-1 flex items-center justify-center gap-2 bg-lavender text-charcoal px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
        >
          <Calendar className="w-4 h-4" />
          Generate 7-Day Plan
        </button>
        <button
          type="button"
          onClick={triggerFileUpload}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-300 ${
            selectedFile
              ? "bg-mint/20 border-mint text-charcoal"
              : "border-charcoal/10 hover:border-charcoal/30 bg-transparent text-charcoal"
          }`}
        >
          {selectedFile ? <CheckCircle className="w-4 h-4 text-mint-foreground" /> : <Upload className="w-4 h-4" />}
          {selectedFile ? "Change Assignment" : "Upload Assignment"}
        </button>
      </div>

      {/* Suggested Resources */}
      <div>
        <p className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider mb-3">Suggested Resources</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {suggestedResources.map((resource) => (
            <button
              key={resource.label}
              type="button"
              onClick={() => handleResourceClick(resource.url)}
              className={`${resource.color} rounded-2xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
            >
              <resource.icon className="w-5 h-5 mx-auto mb-2 text-charcoal/60" />
              <p className="text-xs font-semibold text-charcoal">{resource.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AIAssistantPanel;