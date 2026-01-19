import { RefObject } from "react";
import { ChatMessage } from "@/interfaces/IChat";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

type Props = {
  messages: ChatMessage[];
  sending: boolean;
  onSend: (text: string) => void;
  bottomRef: RefObject<HTMLDivElement | null>;
};

export default function ChatWindow({
  messages,
  sending,
  onSend,
  bottomRef,
}: Props) {
  return (
    <div
      className="
        mb-3
        w-[90vw] sm:w-80
        h-[70vh] sm:h-96
        max-h-[80vh]
        bg-white/95
        backdrop-blur-sm
        rounded-xl
        shadow-xl
        flex flex-col
        overflow-hidden
        animate-chat-open

      "
    >
      <div className="px-4 py-3 border-b bg-blue-100 flex items-center gap-2">
        <img
          src="/RobotPNG.png"
          alt="VitaBot"
          className="w-6 h-6 object-contain"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">VitaBot</span>
          <span className="text-xs text-gray-500">
            Asistente médico virtual
          </span>
        </div>
      </div>

      <ChatMessages messages={messages} bottomRef={bottomRef} sending={sending} />

      <ChatInput onSend={onSend} disabled={sending} />
    </div>
  );
}
