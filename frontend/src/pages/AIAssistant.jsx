import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Bot,
  User,
  Loader2,
  BrainCircuit,
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
      content: `Hello! I'm your AI Career Assistant. Tap the menu button below to access tools, or ask me anything about internships in Ethiopia.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);

  const tools = [
    { name: "CV Advisor", icon: FileText, action: "cv_advice" },
    { name: "Career Advisor", icon: MessageSquare, action: "career" },
    { name: "Interview Prep", icon: ClipboardList, action: "interview" },
    { name: "App Status", icon: CheckCircle, action: "status" },
  ];

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onerror = (event) => {
        console.error(event.error);
        setIsListening(false);
        alert(event.error === 'not-allowed' ? 'Microphone access denied.' : 'Speech recognition error.');
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported.');
    }
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser.');
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
    } catch {
      alert('Unable to access microphone.');
    }
  };

  const speak = (text) => {
    if (!voiceEnabled) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const getHistoryForBackend = () => messages.map(msg => ({ role: msg.role, content: msg.content }));

  const addAssistantMessage = (content) => {
    setMessages(prev => [...prev, { role: "assistant", content, timestamp: new Date() }]);
    speak(content);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    stopSpeaking();
    setIsLoading(false);
  };

  const makeApiCall = async (endpoint, data) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    try {
      return await api.post(endpoint, data, { signal: abortControllerRef.current.signal });
    } catch (error) {
      if (error.name === 'AbortError') return null;
      throw error;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setInput("");
    setIsLoading(true);
    try {
      const response = await makeApiCall("/ai/chat", { message: userMessage, history: getHistoryForBackend() });
      if (response) addAssistantMessage(response.data.reply || "Sorry, I couldn't generate a response.");
    } catch (error) {
      if (error.name !== 'AbortError') addAssistantMessage("AI service unavailable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolClick = async (tool) => {
    if (isLoading) return;
    setIsLoading(true);
    setToolsDrawerOpen(false);
    try {
      let reply = "";
      if (tool.action === "cv_advice") {
        const response = await makeApiCall("/ai/chat", {
          message: "Act as a CV advisor. Give step‑by‑step advice on writing a professional CV for an Ethiopian internship. Include key sections, formatting tips, and common mistakes. Do NOT generate a full CV, only advice.",
          history: getHistoryForBackend(),
        });
        if (response) reply = response.data.reply;
      } else if (tool.action === "career") {
        const response = await makeApiCall("/ai/chat", {
          message: "Give me general career advice based on my profile.",
          history: getHistoryForBackend(),
        });
        if (response) reply = response.data.reply;
      } else if (tool.action === "interview") {
        const response = await makeApiCall("/ai/chat", {
          message: "Give me general interview preparation tips.",
          history: getHistoryForBackend(),
        });
        if (response) reply = response.data.reply;
      } else if (tool.action === "status") {
        const { data } = await api.get("/announcements/my-announcements");
        if (data.length === 0) {
          reply = "You haven't submitted any internship announcements yet. Go to an internship detail page and click 'Announce to University'.";
        } else {
          reply = "**Your Application Statuses:**\n\n" + data.map(ann => `• **${ann.internship.companyName}**: ${ann.status}`).join("\n");
        }
      }
      if (reply) addAssistantMessage(reply);
    } catch (err) {
      if (err.name !== 'AbortError') addAssistantMessage("Sorry, I couldn't process that request.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setToolsDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <BrainCircuit className="w-6 h-6 text-indigo-600" />
          <h1 className="text-lg font-bold">AI Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={stopSpeaking} className="p-2 rounded-full hover:bg-zinc-100" title="Stop speaking">
            <Square className="w-5 h-5" />
          </button>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-2 rounded-full hover:bg-zinc-100">
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"}`}>
              <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              <div className="text-[10px] opacity-60 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-2xl">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="p-3 border-t bg-white dark:bg-zinc-950">
        <form onSubmit={handleSend} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full p-3 pr-12 rounded-xl border bg-zinc-50 dark:bg-zinc-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-indigo-600 disabled:opacity-50"
            >
              {isLoading ? <StopCircle className="w-5 h-5" onClick={stopGeneration} /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${isListening ? "bg-red-600 text-white animate-pulse" : "bg-zinc-100 dark:bg-zinc-800"}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Bottom drawer for tools */}
      <AnimatePresence>
        {toolsDrawerOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setToolsDrawerOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl shadow-xl p-5"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">AI Tools</h2>
                <button onClick={() => setToolsDrawerOpen(false)} className="p-2 rounded-full hover:bg-zinc-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {tools.map(tool => (
                  <button
                    key={tool.action}
                    onClick={() => handleToolClick(tool)}
                    disabled={isLoading}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 active:scale-95 transition-transform"
                  >
                    <tool.icon className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium">{tool.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;