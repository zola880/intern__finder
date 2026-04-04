import React, { useState } from "react";
import { Bot, X } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import AIAssistant from "../pages/AIAssistant";

const FloatingAIAssistant = () => {
  const { user } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);

  // If user not logged in, you may still show icon but on click redirect to login
  // Or allow limited functionality. For now, we'll show login prompt.
  const handleOpen = () => {
    if (!user) {
      alert("Please login to use the AI Assistant.");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-xl transition-all hover:scale-105 active:scale-95"
        aria-label="Open AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <AIAssistant />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIAssistant;