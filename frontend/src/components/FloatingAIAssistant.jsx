import React, { useState } from "react";
import { Bot } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import AIAssistant from "../pages/AIAssistant";

const FloatingAIAssistant = () => {
  const { user } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeModal();
          }}
          role="presentation"
        >
          <div className="relative h-full w-full overflow-hidden bg-white shadow-2xl dark:bg-zinc-900 sm:h-[85vh] sm:max-w-4xl sm:rounded-2xl">
            <AIAssistant onClose={closeModal} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIAssistant;