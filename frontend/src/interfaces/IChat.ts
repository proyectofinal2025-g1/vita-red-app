export type ChatFrom = "user" | "bot";

export interface ChatMessage {
  id: string;
  from: ChatFrom;
  text: string;
  createdAt: number;
}
