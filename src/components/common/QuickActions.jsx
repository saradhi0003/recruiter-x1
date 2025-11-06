import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function QuickActions({ onAction }) {
  const openAIQuickActions = () => {
    window.dispatchEvent(new Event('openAIQuickActions'));
  };

  return (
    <Button
      onClick={openAIQuickActions}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 transition-all hover:scale-110"
      size="icon"
      title="Ask AI Agent (⌘J)"
    >
      <Sparkles className="w-6 h-6 text-white" />
    </Button>
  );
}