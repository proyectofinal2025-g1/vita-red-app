"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sendChatMessage } from "@/services/chat.service";
import { ChatMessage } from "@/interfaces/IChat";

import ChatButton from "./ChatButton";
import ChatWindow from "./ChatWindow";

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const CHAT_MESSAGES_KEY = "vita_chat_messages";

export default function ChatBot() {
  const { dataUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [showHint, setShowHint] = useState(false);



  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(CHAT_MESSAGES_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChatMessage[];
        setMessages(parsed);
        return;
      } catch {
      }
    }

    setMessages([buildGreetingMessage(dataUser)]);
  }, []);

  


  useEffect(() => {
    if (typeof window === "undefined") return;
    if (messages.length === 0) return;

    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  

  
  useEffect(() => {
    if (!dataUser) {
      const greeting = buildGreetingMessage(null);
      setMessages([greeting]);
      return;
    }



    setMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0].from === "bot" &&
        !prev[0].text.includes(dataUser.user.first_name)
      ) {
        return [buildGreetingMessage(dataUser)];
      }
      return prev;
    });
  }, [dataUser]);



  useEffect(() => {
    if (open) {
      setShowHint(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowHint(true);
    }, 1500); 

    return () => clearTimeout(timer);
  }, [open]);

 


  const extractBotText = (raw: string): string => {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.reply === "string") {
        return parsed.reply;
      }
    } catch {}
    return raw;
  };



  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      from: "user",
      text,
      createdAt: Date.now(),
    };
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const responseText = await sendChatMessage(text, dataUser?.token);

      await sleep(1500);

      const botMessage: ChatMessage = {
        id: generateId(),
        from: "bot",
        text: extractBotText(responseText),
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      await sleep(500);

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          from: "bot",
          text: "Ocurrió un error. Intentá nuevamente.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 z-50 flex flex-col items-end gap-2">
      {open && (
        <ChatWindow
          messages={messages}
          sending={sending}
          onSend={handleSend}
          bottomRef={bottomRef}
        />
      )}

      {showHint && !open && (
        <div className="relative animate-bot-hint">
          <div className="bg-white text-gray-800 text-xs px-3 py-2 rounded-lg shadow-lg max-w-[200px]">
            {dataUser?.user?.first_name
              ? `Hola ${dataUser.user.first_name} 👋 ¿Necesitás ayuda con tus turnos?`
              : "Hola 👋 en que puedo ayudarte? "}
          </div>



          <div className="absolute right-4 -bottom-2 w-3 h-3 bg-white rotate-45 shadow-sm" />
        </div>
      )}

      <ChatButton open={open} toggle={() => setOpen(!open)} />
    </div>
  );
}



function buildGreetingMessage(
  dataUser: ReturnType<typeof useAuth>["dataUser"],
): ChatMessage {
  const userName = dataUser?.user?.first_name;

  return {
    id: generateId(),
    from: "bot",
    text: userName
      ? `Hola 👋 ${userName}, ¿en qué puedo ayudarte?`
      : "Hola 👋 ¿En qué puedo ayudarte?",
    createdAt: Date.now(),
  };
}
