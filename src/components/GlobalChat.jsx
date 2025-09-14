import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axiosInstance from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";
import { uploadFile } from "../lib/api";
import { FiPlus } from "react-icons/fi";

const SOCKET_SERVER_URL = "http://localhost:5001";
const BACKEND_BASE_URL = "http://localhost:5001";

export default function GlobalChat() {
  const { isLoading, authUser } = useAuthUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    async function fetchMessages() {
      try {
        const response = await axiosInstance.get("/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }
    fetchMessages();

    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    socketRef.current.on("removedMessage", (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });
    socketRef.current.on("typing", (username) => setTypingUser(username));
    socketRef.current.on("stopTyping", () => setTypingUser(null));
    socketRef.current.on("reconnect", fetchMessages);

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!authUser?.fullName) return;
    socketRef.current.emit("typing", authUser.fullName);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping");
    }, 1000);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !authUser) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", authUser._id);
    formData.append("username", authUser.fullName);
    formData.append("text", "");

    try {
      const savedMessage = await uploadFile(formData);
      socketRef.current.emit("sendMessage", savedMessage);
      setSelectedFile(null);
    } catch (error) {
      console.error("File upload failed", error.response?.data || error.message || error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !authUser) return;
    const messageData = {
      userId: authUser._id,
      username: authUser.fullName,
      text: newMessage.trim(),
      createdAt: new Date(),
    };
    socketRef.current.emit("sendMessage", messageData);
    try {
      await axiosInstance.post("/messages", messageData);
    } catch (error) {
      console.error("Failed to save message:", error);
    }
    setNewMessage("");
  };

  const deleteMessage = (messageId) => {
    socketRef.current.emit("deleteMessage", messageId);
  };

  const formatDateLabel = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) return "Today";
    if (messageDate.toDateString() === yesterday.toDateString()) return "Yesterday";

    return messageDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading chat user...</div>;
  }

  let lastMessageDateStr = null;

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-lg shadow h-[80vh] flex flex-col mt-4">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 bg-gray-50 flex flex-col">
        {messages.map((msg) => {
          const isOwnMessage = authUser && msg.userId === authUser._id;
          const currentDateStr = new Date(msg.createdAt).toDateString();
          const showDateSeparator = currentDateStr !== lastMessageDateStr;
          lastMessageDateStr = currentDateStr;

          return (
            <React.Fragment key={msg._id || msg.createdAt}>
              {showDateSeparator && (
                <div className=" w-full text-center my-2 text-xs text-gray-500 font-semibold">
                  {formatDateLabel(msg.createdAt)}
                </div>
              )}
              <div
                className={`max-w-[60%] text-xs p-2 rounded-lg break-words flex flex-col ${
                  isOwnMessage
                    ? "bg-gray-800 text-white self-end items-end rounded-br-none"
                    : "bg-gray-200 text-gray-900 self-start items-start rounded-bl-none"
                }`}
              >
                <div className="font-semibold mb-1">
                  {isOwnMessage ? "" : msg.username}
                </div>
                {msg.text && <div>{msg.text}</div>}
                {msg.attachmentUrl && msg.attachmentType.startsWith("image") && (
                  <img
                    src={`${BACKEND_BASE_URL}${msg.attachmentUrl}`}
                    alt="attachment"
                    className="max-w-xs max-h-48 mt-1 rounded"
                  />
                )}
                {msg.attachmentUrl && msg.attachmentType.startsWith("video") && (
                  <video
                    src={`${BACKEND_BASE_URL}${msg.attachmentUrl}`}
                    controls
                    className="max-w-xs max-h-48 mt-1 rounded"
                  />
                )}
                {msg.attachmentUrl &&
                  !msg.attachmentType.startsWith("image") &&
                  !msg.attachmentType.startsWith("video") && (
                    <a
                      href={`${BACKEND_BASE_URL}${msg.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mt-1"
                    >
                      Download Attachment
                    </a>
                  )}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {isOwnMessage && (
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                    title="Delete Message"
                  >
                    &times;
                  </button>
                )}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingUser && (
        <div className="px-4 py-1 text-sm italic text-gray-600">
          {typingUser} is typing...
        </div>
      )}

      <form onSubmit={sendMessage} className="flex border-t border-gray-300 p-4 space-x-3 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleTyping}
            className=" text-black w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <label
            htmlFor="fileUpload"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 text-xl select-none"
            title="Attach file"
          >
            <FiPlus />
          </label>
        </div>
        <button
          type="button"
          onClick={handleFileUpload}
          disabled={!selectedFile}
          className={`bg-green-600 text-white font-semibold rounded-md px-3 hover:bg-green-700 transition ${
            !selectedFile ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Upload selected file"
        >
          Upload
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold rounded-md px-5 hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

