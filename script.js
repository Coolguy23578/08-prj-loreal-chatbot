const API_URL = "https://loreal-chatbot.your-subdomain.workers.dev/";
const SYSTEM_MESSAGE = `
You are a helpful L'Oréal beauty advisor.
Only answer questions about L'Oréal products, skincare, makeup, haircare,
fragrance, beauty routines, and product recommendations.
If a question is unrelated, politely say that you can only help with L'Oréal
products, routines, and recommendations.
Do not invent product details. If you do not know something, say so.
`;

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Keep the conversation so the advisor can understand follow-up questions.
const messages = [{ role: "system", content: SYSTEM_MESSAGE }];

function addMessage(role, content) {
  const message = document.createElement("p");
  message.className = `msg ${role}`;
  message.textContent = content;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

addMessage("ai", "Hello! I can help with L'Oréal products, routines, and recommendations.");

/* Send the user's question to the Cloudflare Worker. */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();
  if (!question) {
    return;
  }

  addMessage("user", question);
  messages.push({ role: "user", content: question });
  userInput.value = "";

  const sendButton = document.getElementById("sendBtn");
  sendButton.disabled = true;
  addMessage("ai", "Thinking...");
  const thinkingMessage = chatWindow.lastElementChild;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error("The API returned no assistant message.");
    }

    messages.push({ role: "assistant", content: reply });
    thinkingMessage.textContent = reply;
  } catch (error) {
    thinkingMessage.textContent =
      "Sorry, I could not connect right now. Please try again.";
    console.error("Chat request failed:", error);
  } finally {
    sendButton.disabled = false;
    userInput.focus();
  }
});
