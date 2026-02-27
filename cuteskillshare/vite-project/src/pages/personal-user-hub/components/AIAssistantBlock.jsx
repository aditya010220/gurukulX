"use client"

import { useState } from "react"
import { Bot, Send, Calendar, Upload, BookOpen, Code, Palette, Brain } from "lucide-react"
import Input from "components/ui/Input"

const suggestedResources = [
  { icon: BookOpen, label: "React Patterns", color: "bg-lavender/30" },
  { icon: Code, label: "TypeScript Guide", color: "bg-mint/30" },
  { icon: Palette, label: "Design Systems", color: "bg-peach/30" },
  { icon: Brain, label: "System Design", color: "bg-soft-blue/30" },
]

export function AIAssistantPanel() {
  const [query, setQuery] = useState("")

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

      {/* Ask AI Input */}
      <div className="relative mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about your learning path..."
          className="h-12 pl-4 pr-12 bg-warm-white border-charcoal/5 rounded-2xl text-sm placeholder:text-charcoal/40 focus:shadow-lg focus:shadow-lavender/20 focus:border-lavender"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-charcoal text-white rounded-xl flex items-center justify-center hover:bg-charcoal/90 transition-all duration-300 hover:scale-105"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="sr-only">Send message</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 bg-lavender text-charcoal px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
        >
          <Calendar className="w-4 h-4" />
          Generate 7-Day Plan
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-charcoal border-2 border-charcoal/10 hover:border-charcoal/30 bg-transparent transition-all duration-300"
        >
          <Upload className="w-4 h-4" />
          Upload Assignment
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