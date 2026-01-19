import { useState } from "react";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="flex items-center gap-2 border-t px-3 py-2 bg-white">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={disabled}
        placeholder="Escribí tu mensaje..."
        className="
          flex-1
          text-sm
          px-3 py-2
          rounded-lg
          border
          focus:outline-none
          focus:ring-2
          focus:ring-primary
          disabled:opacity-50
        "
      />



      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="
          w-10 h-10
          flex items-center justify-center
          rounded-full
          bg-blue-300
          text-white
          text-lg
          hover:bg-primary/90
          transition
          disabled:opacity-40
          shrink-0
        "
        aria-label="Enviar mensaje"
      >
        ➤
      </button>
    </div>
  );
}
