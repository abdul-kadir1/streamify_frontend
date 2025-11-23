


// import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import axiosInstance from "../lib/axios";
// import useAuthUser from "../hooks/useAuthUser";
// import { uploadFile } from "../lib/api";
// import { FiPlus } from "react-icons/fi";

// const SOCKET_SERVER_URL = "http://localhost:5002";
// const BACKEND_BASE_URL = "http://localhost:5002";

// export default function GlobalChat() {
//   const { isLoading, authUser } = useAuthUser();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [typingUser, setTypingUser] = useState(null);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [filePreviewUrl, setFilePreviewUrl] = useState(null); // preview state

//   const typingTimeoutRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     socketRef.current = io(SOCKET_SERVER_URL, {
//       withCredentials: true,
//       reconnection: true,
//       reconnectionAttempts: Infinity,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//     });

//     async function fetchMessages() {
//       try {
//         const response = await axiosInstance.get("/messages");
//         setMessages(response.data);
//       } catch (error) {
//         console.error("Failed to fetch messages:", error);
//       }
//     }
//     fetchMessages();

//     // Use improved message receive handler which removes temp messages properly
//     socketRef.current.on("receiveMessage", (message) => {
//       setMessages((prev) => {
//         // Remove any temp uploading message
//         const filtered = prev.filter((msg) => !msg.uploading);
//         return [...filtered, message];
//       });
//     });

//     socketRef.current.on("removedMessage", (messageId) => {
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
//     });

//     socketRef.current.on("typing", (username) => setTypingUser(username));
//     socketRef.current.on("stopTyping", () => setTypingUser(null));
//     socketRef.current.on("reconnect", fetchMessages);

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Cleanup preview URL on unmount or file change
//   useEffect(() => {
//     return () => {
//       if (filePreviewUrl) {
//         URL.revokeObjectURL(filePreviewUrl);
//       }
//     };
//   }, [filePreviewUrl]);

//   const handleTyping = () => {
//     if (!authUser?.fullName || !socketRef.current) return;
//     socketRef.current.emit("typing", authUser.fullName);
//     clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = setTimeout(() => {
//       socketRef.current.emit("stopTyping");
//     }, 1000);
//   };

//   const handleFileChange = (e) => {
//     if (e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setSelectedFile(file);

//       if (file.type.startsWith("image") || file.type.startsWith("video")) {
//         setFilePreviewUrl(URL.createObjectURL(file));
//       } else {
//         setFilePreviewUrl(null);
//       }
//     }
//   };

//   const handleFileUpload = async () => {
//     if (!selectedFile || !authUser) return;
//     const formData = new FormData();
//     formData.append("file", selectedFile);
//     formData.append("userId", authUser._id);
//     formData.append("username", authUser.fullName);
//     formData.append("text", "");

//     // Optimistic UI: add temp message to show preview instantly
//     setMessages((prev) => [
//       ...prev,
//       {
//         _id: `temp-${Date.now()}`,
//         userId: authUser._id,
//         username: authUser.fullName,
//         text: "",
//         attachmentUrl: filePreviewUrl || "",
//         attachmentType: selectedFile.type,
//         createdAt: new Date().toISOString(),
//         uploading: true,
//       },
//     ]);

//     try {
//       const savedMessage = await uploadFile(formData);

//       // Remove temp message and add saved message after upload success
//       setMessages((prev) => prev.filter((msg) => !msg.uploading));
//       socketRef.current.emit("sendMessage", savedMessage);

//       setSelectedFile(null);
//       setFilePreviewUrl(null);
//     } catch (error) {
//       setMessages((prev) => prev.filter((msg) => !msg.uploading));
//       console.error("File upload failed", error.response?.data || error.message || error);
//     }
//   };

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     if (!newMessage.trim() || !authUser) return;

//     const messageData = {
//       userId: authUser._id,
//       username: authUser.fullName,
//       text: newMessage.trim(),
//       createdAt: new Date(),
//     };

//     socketRef.current.emit("sendMessage", messageData);

//     try {
//       await axiosInstance.post("/messages", messageData);
//     } catch (error) {
//       console.error("Failed to save message:", error);
//     }

//     setNewMessage("");
//   };

//   const deleteMessage = (messageId) => {
//     socketRef.current.emit("deleteMessage", messageId);
//   };

//   const formatDateLabel = (dateString) => {
//     const messageDate = new Date(dateString);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);

//     if (messageDate.toDateString() === today.toDateString()) return "Today";
//     if (messageDate.toDateString() === yesterday.toDateString()) return "Yesterday";
//     return messageDate.toLocaleDateString(undefined, {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   if (isLoading) {
//     return <div className="p-4 text-gray-500">Loading chat user...</div>;
//   }

//   let lastMessageDateStr = null;

//   return (
//     <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-lg shadow h-[80vh] flex flex-col mt-4">
//       <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 bg-gray-50 flex flex-col">
//         {messages.map((msg) => {
//           const isOwnMessage = authUser && msg.userId === authUser._id;
//           const currentDateStr = new Date(msg.createdAt).toDateString();
//           const showDateSeparator = currentDateStr !== lastMessageDateStr;
//           lastMessageDateStr = currentDateStr;

//           return (
//             <React.Fragment key={msg._id || msg.createdAt}>
//               {showDateSeparator && (
//                 <div className="w-full text-center my-2 text-xs text-gray-500 font-semibold">
//                   {formatDateLabel(msg.createdAt)}
//                 </div>
//               )}
//               <div
//                 className={`max-w-[60%] text-xs p-2 rounded-lg break-words flex flex-col ${
//                   isOwnMessage
//                     ? "bg-gray-800 text-white self-end items-end rounded-br-none"
//                     : "bg-gray-200 text-gray-900 self-start items-start rounded-bl-none"
//                 }`}
//               >
//                 <div className="font-semibold mb-1">
//                   {isOwnMessage ? "" : msg.username}
//                 </div>

//                 {msg.text && <div>{msg.text}</div>}

//                 {/* Images */}
//                 {msg.attachmentUrl && msg.attachmentType?.startsWith("image") && (
//                   <img
//                     src={
//                       msg.uploading
//                         ? msg.attachmentUrl
//                         : `${BACKEND_BASE_URL}${msg.attachmentUrl.startsWith("/") ? "" : "/"}${msg.attachmentUrl}`
//                     }
//                     alt="attachment"
//                     className="max-w-xs max-h-48 mt-1 rounded"
//                   />
//                 )}

//                 {/* Videos */}
//                 {msg.attachmentUrl && msg.attachmentType?.startsWith("video") && (
//                   <video
//                     src={
//                       msg.uploading
//                         ? msg.attachmentUrl
//                         : `${BACKEND_BASE_URL}${msg.attachmentUrl.startsWith("/") ? "" : "/"}${msg.attachmentUrl}`
//                     }
//                     controls
//                     className="max-w-xs max-h-48 mt-1 rounded"
//                   />
//                 )}

//                 {/* Files */}
//                 {msg.attachmentUrl &&
//                   !msg.attachmentType?.startsWith("image") &&
//                   !msg.attachmentType?.startsWith("video") && (
//                     <a
//   href={
//     msg.uploading
//       ? msg.attachmentUrl
//       : `${BACKEND_BASE_URL}${msg.attachmentUrl.startsWith("/") ? "" : "/"}${msg.attachmentUrl}`
//   }
//   download={msg.attachmentName || undefined}  // download attribute with filename
//   target="_blank"
//   rel="noopener noreferrer"
//   className="text-blue-600 underline mt-1"
// >
//   {msg.attachmentName || "Download"}
// </a>

//                   )}

//                 <div className="text-xs text-gray-400 mt-1">
//                   {new Date(msg.createdAt).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </div>
//                 {isOwnMessage && (
//                   <button
//                     onClick={() => deleteMessage(msg._id)}
//                     className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
//                     title="Delete Message"
//                   >
//                     &times;
//                   </button>
//                 )}
//               </div>
//             </React.Fragment>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       {typingUser && (
//         <div className="px-4 py-1 text-sm italic text-gray-600">
//           {typingUser} is typing...
//         </div>
//       )}

//       <form
//         onSubmit={sendMessage}
//         className="flex border-t border-gray-300 p-4 space-x-3 items-center"
//       >
//         <div className="relative flex-1">
//           <input
//             type="text"
//             placeholder="Type a message..."
//             value={newMessage}
//             onChange={(e) => {
//               setNewMessage(e.target.value);
//               handleTyping();
//             }}
//             onKeyDown={handleTyping}
//             className="text-black w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
//           />
//           <input
//             type="file"
//             id="fileUpload"
//             onChange={handleFileChange}
//             className="hidden"
//             accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//           />
//           <label
//             htmlFor="fileUpload"
//             className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 text-xl select-none"
//             title="Attach file"
//           >
//             <FiPlus />
//           </label>
//         </div>
//         {/* Preview */}
//         <div>
//           {filePreviewUrl && selectedFile?.type.startsWith("image") && (
//             <img src={filePreviewUrl} alt="preview" className="max-w-xs max-h-40 mt-2 rounded" />
//           )}
//           {filePreviewUrl && selectedFile?.type.startsWith("video") && (
//             <video src={filePreviewUrl} controls className="max-w-xs max-h-40 mt-2 rounded" />
//           )}
//           {selectedFile && !selectedFile.type.startsWith("image") && !selectedFile.type.startsWith("video") && (
//             <div className="mt-2 text-xs text-gray-600 border rounded px-2 py-1">{selectedFile.name}</div>
//           )}
//         </div>
//         {/* End Preview */}
//         <button
//           type="button"
//           onClick={handleFileUpload}
//           disabled={!selectedFile}
//           className={`bg-green-600 text-white font-semibold rounded-md px-3 hover:bg-green-700 transition ${
//             !selectedFile ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           title="Upload selected file"
//         >
//           Upload
//         </button>
//         <button
//           type="submit"
//           className="bg-blue-600 text-white font-semibold rounded-md px-5 hover:bg-blue-700 transition"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// }




import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axiosInstance from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";
import { uploadFile } from "../lib/api";
import { FiPlus } from "react-icons/fi";

const SOCKET_SERVER_URL = "http://localhost:5002";
const BACKEND_BASE_URL = "http://localhost:5002";

export default function GlobalChat() {
  const { isLoading, authUser } = useAuthUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

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

    // Replace temp uploading message with actual message on receive
    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => {
        // Find temp message with same userId and attachmentUrl
        const tempIndex = prev.findIndex(
          (msg) =>
            msg.uploading &&
            msg.userId === message.userId &&
            msg.attachmentUrl === message.attachmentUrl
        );
        if (tempIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempIndex] = message;
          return newMessages;
        } else {
          return [...prev, message];
        }
      });
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

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleTyping = () => {
    if (!authUser?.fullName || !socketRef.current) return;
    socketRef.current.emit("typing", authUser.fullName);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping");
    }, 1000);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      if (file.type.startsWith("image") || file.type.startsWith("video")) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !authUser) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", authUser._id);
    formData.append("username", authUser.fullName);
    formData.append("text", "");

    // Add temp uploading message with filename
    setMessages((prev) => [
      ...prev,
      {
        _id: `temp-${Date.now()}`,
        userId: authUser._id,
        username: authUser.fullName,
        text: "",
        attachmentUrl: filePreviewUrl || "",
        attachmentType: selectedFile.type,
        attachmentName: selectedFile.name,
        createdAt: new Date().toISOString(),
        uploading: true,
      },
    ]);

    try {
      const savedMessage = await uploadFile(formData);
      // Remove temp uploading message after success
      setMessages((prev) => prev.filter((msg) => !msg.uploading));
      // Emit actual saved message to all
      socketRef.current.emit("sendMessage", savedMessage);
      setSelectedFile(null);
      setFilePreviewUrl(null);
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => !msg.uploading));
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
    return messageDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
                <div className="w-full text-center my-2 text-xs text-gray-500 font-semibold">
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
                <div className="font-semibold mb-1">{isOwnMessage ? "" : msg.username}</div>
                {msg.text && <div>{msg.text}</div>}

                {msg.attachmentUrl && msg.attachmentType?.startsWith("image") && (
                  <img
                    src={
                      msg.uploading
                        ? msg.attachmentUrl
                        : `${BACKEND_BASE_URL}${msg.attachmentUrl.startsWith("/") ? "" : "/"}${msg.attachmentUrl}`
                    }
                    alt="attachment"
                    className="max-w-xs max-h-48 mt-1 rounded"
                  />
                )}

                {msg.attachmentUrl && msg.attachmentType?.startsWith("video") && (
                  <video
                    src={
                      msg.uploading
                        ? msg.attachmentUrl
                        : `${BACKEND_BASE_URL}${msg.attachmentUrl.startsWith("/") ? "" : "/"}${msg.attachmentUrl}`
                    }
                    controls
                    className="max-w-xs max-h-48 mt-1 rounded"
                  />
                )}

                {msg.attachmentUrl && !msg.attachmentType?.startsWith("image") && !msg.attachmentType?.startsWith("video") && (
                  <a
                    href={
                      msg.uploading
                        ? msg.attachmentUrl
                        : `${BACKEND_BASE_URL}${msg.attachmentUrl.startsWith("/") ? "" : "/"}${msg.attachmentUrl}`
                    }
                    download={msg.attachmentName || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-1"
                  >
                    {msg.attachmentName || "Download"}
                  </a>
                )}

                <div className="text-xs text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                {isOwnMessage && (
                  <button onClick={() => deleteMessage(msg._id)} className="text-sm text-red-600 hover:text-red-800 focus:outline-none" title="Delete Message">
                    &times;
                  </button>
                )}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {typingUser && <div className="px-4 py-1 text-sm italic text-gray-600">{typingUser} is typing...</div>}

      <form onSubmit={sendMessage} className="flex border-t border-gray-300 p-4 space-x-3 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleTyping}
            className="text-black w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <label htmlFor="fileUpload" className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 text-xl select-none" title="Attach file">
            <FiPlus />
          </label>
        </div>
        <div>
          {filePreviewUrl && selectedFile?.type.startsWith("image") && <img src={filePreviewUrl} alt="preview" className="max-w-xs max-h-40 mt-2 rounded" />}
          {filePreviewUrl && selectedFile?.type.startsWith("video") && <video src={filePreviewUrl} controls className="max-w-xs max-h-40 mt-2 rounded" />}
          {selectedFile && !selectedFile.type.startsWith("image") && !selectedFile.type.startsWith("video") && (
            <div className="mt-2 text-xs text-gray-600 border rounded px-2 py-1">{selectedFile.name}</div>
          )}
        </div>
        <button type="button" onClick={handleFileUpload} disabled={!selectedFile} className={`bg-green-600 text-white font-semibold rounded-md px-3 hover:bg-green-700 transition ${!selectedFile ? "opacity-50 cursor-not-allowed" : ""}`} title="Upload selected file">
          Upload
        </button>
        <button type="submit" className="bg-blue-600 text-white font-semibold rounded-md px-5 hover:bg-blue-700 transition">
          Send
        </button>
      </form>
    </div>
  );
}
 

