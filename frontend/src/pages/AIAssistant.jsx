import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  AudioLines,
  Bot,
  BriefcaseBusiness,
  CheckCircle,
  FileText,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import api from "../services/api";

const starterPrompts = [
  "Find internships that fit my profile",
  "Help me improve my CV",
  "How should I prepare for an interview?",
];

const tools = [
  {
    name: "CV review",
    description: "Practical advice for your next application",
    icon: FileText,
    prompt:
      "Act as a CV advisor. Give me step-by-step advice on writing a professional CV for an Ethiopian internship. Include key sections, formatting tips, and common mistakes. Do not generate a full CV.",
  },
  {
    name: "Career direction",
    description: "Explore a path that fits your goals",
    icon: BriefcaseBusiness,
    prompt: "Give me career advice based on my profile and suggest practical next steps.",
  },
  {
    name: "Interview practice",
    description: "Build confidence before your interview",
    icon: MessageCircle,
    prompt: "Help me prepare for an internship interview with practical tips and sample questions.",
  },
  {
    name: "Application updates",
    description: "Check your university announcement status",
    icon: CheckCircle,
    action: "status",
  },
];

const AIAssistant = ({ onClose }) => {
  const { user } = useProfile();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I can help you find opportunities, strengthen your CV, and feel ready for your next interview. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRef = useRef(null);
  const abortControllerRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const imageUrlsRef = useRef(new Set());

  const revokeImageUrl = (url) => {
    if (url && imageUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      imageUrlsRef.current.delete(url);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const speak = async (text) => {
    if (!voiceEnabled) return;
    stopSpeaking();
    try {
      const { data } = await api.post(
        "/ai/speak",
        { text: text.slice(0, 3000) },
        { responseType: "blob" },
      );
      const audioUrl = URL.createObjectURL(data);
      audioUrlRef.current = audioUrl;
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (audioUrlRef.current === audioUrl) {
          audioUrlRef.current = null;
          audioRef.current = null;
        }
      };
      await audioRef.current.play();
    } catch (error) {
      console.warn("Groq voice playback unavailable; using browser speech instead.", error);
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      } else {
        setErrorMessage("Voice playback is not supported in this browser.");
      }
    }
  };

  const addAssistantMessage = (content) => {
    setMessages((current) => [
      ...current,
      { role: "assistant", content, timestamp: new Date() },
    ]);
    speak(content);
  };

  const getRequestError = (error, fallback) =>
    error.response?.data?.message || fallback;

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  const handleSend = async (event) => {
    event?.preventDefault();
    const message = input.trim();
    if ((!message && !selectedImage) || isLoading) return;

    const image = selectedImage;
    const prompt = message || "Please describe this image.";
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: prompt,
        imagePreview: image?.preview,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setSelectedImage(null);
    setErrorMessage("");
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      let response;
      if (image) {
        const formData = new FormData();
        formData.append("image", image.file);
        formData.append("message", prompt);
        formData.append("history", JSON.stringify(history));
        response = await api.post("/ai/analyze-image", formData, {
          signal: abortControllerRef.current.signal,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post(
          "/ai/chat",
          { message, history },
          { signal: abortControllerRef.current.signal },
        );
      }
      if (response.data.reply) addAssistantMessage(response.data.reply);
      else setErrorMessage("The AI returned an empty response. Please try again.");
    } catch (error) {
      if (error.code !== "ERR_CANCELED" && error.name !== "AbortError") {
        setErrorMessage(getRequestError(error, "The AI could not respond. Please try again."));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Choose an image file to attach.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Images must be 10 MB or smaller.");
      return;
    }
    if (selectedImage) revokeImageUrl(selectedImage.preview);
    const preview = URL.createObjectURL(file);
    imageUrlsRef.current.add(preview);
    setSelectedImage({ file, preview });
    setErrorMessage("");
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setErrorMessage("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) audioChunksRef.current.push(event.data);
      };
      recorder.onerror = () => setErrorMessage("Audio recording failed. Please try again.");
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setIsRecording(false);
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (!blob.size) {
          setErrorMessage("No audio was captured. Please try recording again.");
          return;
        }
        const extension = blob.type.includes("mp4")
          ? "mp4"
          : blob.type.includes("ogg")
            ? "ogg"
            : blob.type.includes("wav")
              ? "wav"
              : "webm";
        const formData = new FormData();
        formData.append("audio", blob, `voice-message.${extension}`);
        setIsTranscribing(true);
        setErrorMessage("");
        try {
          const { data } = await api.post("/ai/transcribe", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (data.text?.trim()) setInput((current) => `${current}${current ? " " : ""}${data.text.trim()}`);
          else setErrorMessage("No speech was detected. Try again in a quieter place.");
        } catch (error) {
          setErrorMessage(getRequestError(error, "Audio transcription failed. Please try again."));
        } finally {
          setIsTranscribing(false);
        }
      };
      recorder.start();
      setIsRecording(true);
      setErrorMessage("");
    } catch (error) {
      console.error("Unable to start audio recording:", error);
      setErrorMessage("Microphone access was denied or is unavailable.");
    }
  };

  const handleToolClick = async (tool) => {
    if (isLoading) return;
    setToolsDrawerOpen(false);
    if (tool.action === "status") {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const { data } = await api.get("/announcements/my-announcements");
        const reply = data.length
          ? `Your application statuses:\n\n${data
              .map((announcement) => `• ${announcement.internship.companyName}: ${announcement.status}`)
              .join("\n")}`
          : "You haven't submitted any internship announcements yet. Open an internship and choose “Announce to University” to get started.";
        addAssistantMessage(reply);
      } catch (error) {
        setErrorMessage(getRequestError(error, "Couldn't load your application updates."));
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setInput(tool.prompt);
    window.setTimeout(() => {
      const form = document.getElementById("ai-assistant-form");
      form?.requestSubmit();
    }, 0);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, isTranscribing]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      stopSpeaking();
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  return (
    <div className="flex h-full min-h-[480px] min-w-0 flex-col overflow-hidden bg-[#f7f8fc] text-slate-900 dark:bg-[#10111a] dark:text-slate-100">
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#141520]/90 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-bold tracking-tight sm:text-base">EthioIntern AI</h1>
              <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300 sm:inline-flex">
                CAREER COPILOT
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Here to help with your next step
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setToolsDrawerOpen(true)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <span className="hidden sm:inline">Career tools</span>
            <span className="sm:hidden">Tools</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) stopSpeaking();
              setVoiceEnabled((enabled) => !enabled);
            }}
            title={voiceEnabled ? "Turn voice replies off" : "Turn voice replies on"}
            aria-label={voiceEnabled ? "Turn voice replies off" : "Turn voice replies on"}
            className={`rounded-xl p-2.5 transition ${
              voiceEnabled
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            }`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close assistant and return to the website"
              aria-label="Close assistant and return to the website"
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pb-5 pt-6 sm:px-8 sm:pt-8">
          {messages.length === 1 && (
            <section className="relative mb-8 overflow-hidden rounded-[26px] border border-indigo-100 bg-white p-5 shadow-[0_16px_50px_-32px_rgba(79,70,229,0.35)] dark:border-white/10 dark:bg-[#191a27] sm:p-7">
              <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-violet-200/50 blur-3xl dark:bg-indigo-500/10" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your career, one conversation away
                </div>
                <h2 className="max-w-xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  {user?.fullName ? `Let’s find your next step, ${user.fullName.split(" ")[0]}.` : "Make your next move count."}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Get thoughtful, personalized help with internships, applications, CVs, and career questions.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {starterPrompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-3 text-left text-xs font-medium leading-5 text-slate-600 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          <div className="space-y-5">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <motion.div
                  key={`${message.timestamp.getTime()}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="mb-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] ${
                      isUser
                        ? "rounded-[20px] rounded-br-md bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-3 text-white shadow-lg shadow-indigo-600/15"
                        : "rounded-[20px] rounded-bl-md border border-slate-200/80 bg-white px-4 py-3.5 text-slate-700 shadow-sm dark:border-white/10 dark:bg-[#1b1c29] dark:text-slate-200"
                    }`}
                  >
                    {message.imagePreview && (
                      <img
                        src={message.imagePreview}
                        alt="Attached for analysis"
                        className="mb-3 max-h-56 max-w-full rounded-xl object-contain"
                      />
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                    <p className={`mt-2 text-[10px] ${isUser ? "text-indigo-100/70" : "text-slate-400 dark:text-slate-500"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {isLoading && (
              <div className="flex items-end gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-[20px] rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-[#1b1c29] dark:text-slate-400">
                  <LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" />
                  Thinking through it…
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="shrink-0 border-t border-slate-200/80 bg-white/90 px-3 pb-3 pt-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#141520]/95 sm:px-6 sm:pb-4">
        <div className="mx-auto max-w-3xl">
          {errorMessage && (
            <div role="alert" className="mb-2 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
              <span>{errorMessage}</span>
              <button type="button" aria-label="Dismiss error" onClick={() => setErrorMessage("")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {(selectedImage || isRecording || isTranscribing) && (
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {selectedImage && (
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                  <img src={selectedImage.preview} alt="Selected attachment" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      revokeImageUrl(selectedImage.preview);
                      setSelectedImage(null);
                    }}
                    aria-label="Remove attached image"
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/65 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {isRecording && (
                <span className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                  Recording… tap the microphone to finish
                </span>
              )}
              {isTranscribing && (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Transcribing your voice…
                </span>
              )}
            </div>
          )}
          <form
            id="ai-assistant-form"
            onSubmit={handleSend}
            className="flex items-end gap-1.5 rounded-[22px] border border-slate-200 bg-white p-1.5 shadow-[0_8px_32px_-18px_rgba(15,23,42,0.3)] transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-[#1b1c29] dark:focus-within:border-indigo-400/50"
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              className="hidden"
              aria-label="Attach an image"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Attach an image"
              aria-label="Attach an image"
              className="mb-0.5 rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-300"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about internships, CVs, interviews…"
              rows={1}
              className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-1 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              aria-label="Message the AI career assistant"
            />
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isLoading || isTranscribing}
              title={isRecording ? "Stop recording" : "Record a voice message"}
              aria-label={isRecording ? "Stop voice recording" : "Record a voice message"}
              className={`mb-0.5 rounded-xl p-2.5 transition disabled:opacity-40 ${
                isRecording
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300"
                  : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-300"
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            {isLoading ? (
              <button
                type="button"
                onClick={stopGeneration}
                title="Stop response"
                aria-label="Stop response"
                className="mb-0.5 rounded-xl bg-slate-100 p-2.5 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:bg-white/5 dark:text-slate-300"
              >
                <span className="block h-4 w-4 rounded-sm bg-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isTranscribing}
                title="Send message"
                aria-label="Send message"
                className="mb-0.5 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 text-white shadow-md shadow-indigo-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            )}
          </form>
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
            <AudioLines className="h-3 w-3" />
            Use the mic to speak, attach an image, or type your question
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {toolsDrawerOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close career tools"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setToolsDrawerOpen(false)}
              className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#171823] sm:p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-2 inline-flex rounded-xl bg-violet-50 p-2 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold">Career tools</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A little help for every next step.</p>
                </div>
                <button
                  type="button"
                  aria-label="Close career tools"
                  onClick={() => setToolsDrawerOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 space-y-2">
                {tools.map((tool) => (
                  <button
                    key={tool.name}
                    type="button"
                    onClick={() => handleToolClick(tool)}
                    disabled={isLoading}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50/60 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                      <tool.icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{tool.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{tool.description}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
                <p className="text-sm font-semibold">Made for your career journey</p>
                <p className="mt-1 text-xs leading-5 text-indigo-100">Ask follow-up questions any time. Your assistant can use your profile to make advice more relevant.</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;
