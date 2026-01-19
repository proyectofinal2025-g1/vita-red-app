import { RefObject } from "react";
import { ChatMessage } from "@/interfaces/IChat";

type Props = {
  messages: ChatMessage[];
  bottomRef: RefObject<HTMLDivElement | null>;
  sending?: boolean;
};

export default function ChatMessages({
  messages,
  bottomRef,
  sending,
}: Props) {
  return (
    <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50">
      {messages.map((m) => {
        const isUser = m.from === "user";

        return (
          <div
            key={m.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div className="flex items-end gap-2 max-w-[90%]">
              {!isUser && (
                <img
                  src="/RobotPNG.png"
                  alt="VitaBot"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                />
              )}


              
              <div
                className={`
                  px-4 py-2
                  rounded-2xl
                  text-sm
                  bg-blue-100
                  leading-relaxed
                  whitespace-pre-line
                  min-w-[40px]
                  ${
                    isUser
                      ? "bg-white text-black border rounded-br-sm"
                      : "bg-primary text-gray-900 border rounded-bl-sm"
                  }
                `}
              >
                {m.text}
              </div>



              {isUser && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary shrink-0">
                  Tú
                </div>
              )}
            </div>
          </div>
        );
      })}



      {sending && (
        <div className="flex items-center gap-2 text-xs text-gray-800 animate-pulse">
          <img
            src="/robotPNG.png"
            alt="VitaBot"
            className="w-6 h-6 object-contain text-black"
          />
          <span>VitaBot está escribiendo…</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
