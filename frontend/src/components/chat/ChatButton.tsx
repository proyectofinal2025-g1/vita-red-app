type Props = {
  open: boolean;
  toggle: () => void;
};

export default function ChatButton({ toggle }: Props) {
  return (
    <button
      onClick={toggle}
      aria-label="Abrir chat"
      className="w-25 h-25 hover:scale-105 transition focus:outline-none"
    >
      <img
        src="/RobotPNG.png"
        alt="Robot"
        className="w-full h-full object-contain"
      />
    </button>
  );
}
