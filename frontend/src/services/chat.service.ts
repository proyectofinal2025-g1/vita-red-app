const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const sendChatMessage = async (
  message: string,
  token?: string
): Promise<string> => {
  if (!API_URL) {
    throw new Error("API URL no definida");
  }

  const res = await fetch(`${API_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Error en el chat");
  }

  return res.text(); 
};
