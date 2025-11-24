 

// import React, { useState, useRef, useEffect } from "react";
// import axios from "../lib/axios";

// export default function ChatbotWidget() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "Hi! Ask me anything about your language learning." },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [visible, setVisible] = useState(true);
//   const messagesEndRef = useRef(null);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMsg = { sender: "user", text: input };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await axios.post("/chatbot", { message: input });
//       const botMsg = { sender: "bot", text: res.data.reply };
//       setMessages((prev) => [...prev, botMsg]);
//     } catch (err) {
//       const errorMsg = {
//         sender: "bot",
//         text: "Sorry, I am having trouble right now. Please try again later.",
//       };
//       setMessages((prev) => [...prev, errorMsg]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   if (!visible)
//     return (
//       <button
//         onClick={() => setVisible(true)}
//         aria-label="Open Chatbot"
//         className="fixed bottom-5 right-5 p-3 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition"
//       >
//         💬
//       </button>
//     );

//   return (
//     <div className="fixed bottom-5 right-5 w-80 h-[450px] bg-white border border-gray-300 rounded-lg shadow-2xl flex flex-col z-50">
//       <div className="p-3 bg-violet-600 text-white font-semibold flex justify-between items-center rounded-t-lg">
//         Chatbot
//         <button
//           onClick={() => setVisible(false)}
//           className="text-white text-xl font-bold hover:text-gray-200 transition"
//           aria-label="Close Chatbot"
//         >
//           &times;
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto p-3 text-sm space-y-2">
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
//             <div
//               className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] break-words ${
//                 msg.sender === "user"
//                   ? "bg-violet-600 text-white"
//                   : "bg-gray-200 text-black"
//               }`}
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="p-3 border-t border-gray-300 flex items-start space-x-2">
//         <textarea
//           rows={1}
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Ask me about language learning..."
//           disabled={loading}
//           className="flex-1 resize-none rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-black"
//         />
//         <button
//           onClick={sendMessage}
//           disabled={loading}
//           className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 disabled:opacity-50 transition"
//           aria-label="Send message"
//         >
//           {loading ? "..." : "Send"}
//         </button>
//       </div>
//     </div>
//   );
// }



import React, { useState, useRef, useEffect } from "react";
import axios from "../lib/axios";

export default function ChatbotWidget() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about your language learning." },
  ]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Make POST request to backend
      const res = await axios.post("/chatbot", { message: input });

      const botMsg = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        sender: "bot",
        text: "Sorry, I am having trouble right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!visible)
    return (
      <button
        onClick={() => setVisible(true)}
        aria-label="Open Chatbot"
        className="fixed bottom-5 right-5 p-3 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition"
      >
        💬
      </button>
    );

  return (
    <div className="fixed bottom-5 right-5 w-80 h-[450px] bg-white border border-gray-300 rounded-lg shadow-2xl flex flex-col z-50">
      <div className="p-3 bg-violet-600 text-white font-semibold flex justify-between items-center rounded-t-lg">
        Chatbot
        <button
          onClick={() => setVisible(false)}
          className="text-white text-xl font-bold hover:text-gray-200 transition"
          aria-label="Close Chatbot"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 text-sm space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                msg.sender === "user"
                  ? "bg-violet-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-300 flex items-start space-x-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about language learning..."
          disabled={loading}
          className="flex-1 resize-none rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-black"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 disabled:opacity-50 transition"
          aria-label="Send message"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
