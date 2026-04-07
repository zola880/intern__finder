import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  BrainCircuit,
  Lightbulb,
  Target,
  GraduationCap,
  Briefcase,
  Users,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  MessageSquare,
  ClipboardList,
  CheckCircle,
  Menu,
  X,
  StopCircle,
  Square
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import api from "../services/api";

const AIAssistant = () => {
  const { user } = useProfile();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I'm your AI Career Assistant. I can help you with internship advice tailored to Ethiopian students. Based on your profile, I can provide personalized guidance for your career journey.\n\nChoose a tool from the sidebar to get started!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Tools configuration – CV Generator changed to Advisor
  const tools = [
    { name: "CV Generator Advisor", icon: FileText, action: "cv_advice", description: "Get advice on writing your CV" },
    { name: "Career Advisor", icon: MessageSquare, action: "career", description: "Get career guidance" },
    { name: "Interview Prep", icon: ClipboardList, action: "interview", description: "Prepare for interviews" },
    { name: "Application Status", icon: CheckCircle, action: "status", description: "Check application status" },
  ];

  // Stop any ongoing speech
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Microphone permission error:', err);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const speak = (text) => {
    if (!voiceEnabled) return;
    stopSpeaking(); // Cancel any previous speech before starting new
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getHistoryForBackend = () => {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  };

  const addAssistantMessage = (content) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: content,
        timestamp: new Date(),
      },
    ]);
    speak(content);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopSpeaking(); // Also stop any speech
    setIsLoading(false);
  };

  const makeApiCall = async (endpoint, data) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    try {
      const response = await api.post(endpoint, data, {
        signal: abortControllerRef.current.signal,
      });
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
        return null;
      }
      throw error;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await makeApiCall("/ai/chat", {
        message: userMessage,
        history: getHistoryForBackend(),
      });
      if (response) {
        const aiReply = response.data.reply || "Sorry, I couldn't generate a response.";
        addAssistantMessage(aiReply);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("AI chat error:", error);
        let errorMessage = "Sorry, the AI service is currently unavailable. Please try again later.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        addAssistantMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleToolClick = async (tool) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      let reply = "";
      if (tool.action === "cv_advice") {
        const response = await makeApiCall("/ai/chat", {
          message: "Act as a CV advisor. Give me step-by-step advice on how to write a professional CV for an internship in Ethiopia. Include key sections, formatting tips, and common mistakes to avoid. Do not generate a full CV, only advice.",
          history: getHistoryForBackend(),
        });
        if (response) reply = response.data.reply;
        else reply = "Request cancelled.";
      } else if (tool.action === "career") {
        const response = await makeApiCall("/ai/chat", {
          message: "Give me general career advice based on my profile.",
          history: getHistoryForBackend(),
        });
        if (response) reply = response.data.reply;
        else reply = "Request cancelled.";
      } else if (tool.action === "interview") {
        const response = await makeApiCall("/ai/chat", {
          message: "Give me general interview preparation tips.",
          history: getHistoryForBackend(),
        });
        if (response) reply = response.data.reply;
        else reply = "Request cancelled.";
      } else if (tool.action === "status") {
        const { data } = await api.get("/announcements/my-announcements");
        if (data.length === 0) {
          reply = "You haven't submitted any internship announcements yet. Go to an internship detail page and click 'Announce to University' to get started.";
        } else {
          reply = "**Your Application Statuses:**\n\n";
          data.forEach((ann) => {
            reply += `• **${ann.internship.companyName}**: ${ann.status}\n`;
          });
        }
      }
      if (reply && reply !== "Request cancelled.") {
        addAssistantMessage(reply);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        addAssistantMessage("Sorry, I couldn't process that request. Please try again.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">AI Tools</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {tools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => handleToolClick(tool)}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500/50 transition-all text-left group"
              >
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <tool.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{tool.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{tool.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-indigo-600" />
                AI Career Assistant
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Get personalized guidance for internships in Ethiopia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Stop Speaking Button */}
            <button
              onClick={stopSpeaking}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              title="Stop speaking"
            >
              <Square className="w-5 h-5" />
            </button>
            {/* Voice toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              title={voiceEnabled ? "Disable voice replies" : "Enable voice replies"}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-8">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                <Bot className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Ready to help you grow</h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Choose a tool from the sidebar or ask me anything about internships and career guidance in Ethiopia!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    msg.role === "user"
                      ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      : "bg-indigo-600/10 border-indigo-500/20"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <Bot className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-5 py-4 rounded-2xl leading-relaxed text-[15px] ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </motion.div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 px-5 py-4 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <form onSubmit={handleSend} className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your career..."
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white shadow-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() && !isLoading}
                onClick={isLoading ? stopGeneration : undefined}
                className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? <StopCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;