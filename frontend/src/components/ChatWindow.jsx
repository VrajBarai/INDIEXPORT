import { useState, useEffect, useRef } from "react";
import { getChatMessages, sendMessage, markMessagesAsRead, getOrCreateChatRoom } from "../services/chatService";
import { getSellerProfile } from "../services/sellerService";
import { getBuyerProfile } from "../services/buyerService";
// Note: Install WebSocket dependencies: npm install sockjs-client @stomp/stompjs
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";

const ChatWindow = ({ inquiryId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatRoom, setChatRoom] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fileInput, setFileInput] = useState(null);
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);

    const userRole = localStorage.getItem("role") || "";

    useEffect(() => {
        initializeChat();
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [inquiryId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            setError("");
            const [roomRes, profileRes] = await Promise.all([
                getOrCreateChatRoom(inquiryId),
                userRole.includes("SELLER") ? getSellerProfile() : getBuyerProfile(),
            ]);
            setChatRoom(roomRes.data);
            setCurrentUser(profileRes.data.user);

            // Load existing messages
            const messagesRes = await getChatMessages(roomRes.data.id);
            setMessages(messagesRes.data || []);

            // Connect WebSocket
            connectWebSocket(roomRes.data.id);

            // Mark messages as read
            await markMessagesAsRead(roomRes.data.id);
        } catch (err) {
            console.error("Chat init error:", err);
            setError(err.response?.data?.message || "Failed to initialize chat");
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = (roomId) => {
        // WebSocket implementation - requires sockjs-client and @stomp/stompjs
        // For now, using polling. Uncomment when WebSocket libraries are installed:
        /*
        const socket = new SockJS("/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
                    const newMsg = JSON.parse(message.body);
                    setMessages((prev) => [...prev, newMsg]);
                    markMessagesAsRead(roomId).catch(console.error);
                });
            },
            onStompError: (frame) => {
                console.error("WebSocket error:", frame);
            },
        });
        stompClient.activate();
        stompClientRef.current = stompClient;
        */

        // Polling fallback - refresh messages every 3 seconds
        const pollInterval = setInterval(() => {
            getChatMessages(roomId).then(res => {
                setMessages(res.data || []);
            }).catch(console.error);
        }, 3000);

        return () => clearInterval(pollInterval);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !fileInput) return;

        try {
            setError("");
            const messageData = {
                message: newMessage,
                fileName: fileInput?.name || null,
                fileUrl: fileInput ? URL.createObjectURL(fileInput) : null, // In production, upload to server first
            };

            await sendMessage(chatRoom.id, messageData);
            setNewMessage("");
            setFileInput(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to send message";
            setError(errorMsg);

            // Show upgrade modal if BASIC seller tries to send file
            if (errorMsg.includes("ADVANCED") || errorMsg.includes("upgrade")) {
                alert("File sharing is only available for ADVANCED sellers. Please upgrade to use this feature.");
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if seller is BASIC
        if (userRole.includes("SELLER") && currentUser?.sellerMode === "BASIC") {
            e.target.value = "";
            alert("File sharing is only available for ADVANCED sellers. Please upgrade to use this feature.");
            return;
        }

        setFileInput(file);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    const isAdvanced = userRole.includes("SELLER") && currentUser?.sellerMode === "ADVANCED";

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                Loading chat...
            </div>
        );
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "600px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden"
        }}>
            {/* Chat Header */}
            <div style={{
                padding: "15px 20px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>
                        Chat - {chatRoom?.productName}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Buyer: {chatRoom?.buyerName}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        color: "#64748b"
                    }}
                >
                    Close
                </button>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                backgroundColor: "#f8fafc"
            }}>
                {error && (
                    <div style={{
                        backgroundColor: "#fef2f2",
                        color: "#b91c1c",
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "15px",
                        fontSize: "14px"
                    }}>
                        {error}
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const isSellerMessage = msg.senderType === "SELLER";
                    return (
                        <div
                            key={msg.id}
                            style={{
                                display: "flex",
                                justifyContent: isMe ? "flex-end" : "flex-start",
                                marginBottom: "15px"
                            }}
                        >
                            <div style={{
                                maxWidth: "70%",
                                backgroundColor: isMe ? "#2563eb" : "#fff",
                                color: isMe ? "#fff" : "#1e293b",
                                padding: "12px 16px",
                                borderRadius: "18px",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                            }}>
                                <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>
                                    {msg.senderName} {isMe && "(You)"}
                                </div>
                                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                    {msg.message}
                                </div>
                                {msg.fileName && (
                                    <div style={{ marginTop: "8px", padding: "8px", backgroundColor: isMe ? "rgba(255,255,255,0.2)" : "#f1f5f9", borderRadius: "6px" }}>
                                        <div style={{ fontSize: "12px", fontWeight: "600" }}>📎 {msg.fileName}</div>
                                        {msg.fileUrl && (
                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: isMe ? "#fff" : "#2563eb", fontSize: "12px" }}>
                                                Download
                                            </a>
                                        )}
                                    </div>
                                )}
                                <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>
                                    {formatTime(msg.createdAt)} {msg.isRead && isMe && "✓✓"}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: "15px 20px",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#fff"
            }}>
                {fileInput && (
                    <div style={{
                        padding: "8px 12px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "6px",
                        marginBottom: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ fontSize: "13px", color: "#475569" }}>📎 {fileInput.name}</span>
                        <button
                            onClick={() => setFileInput(null)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                    {isAdvanced && (
                        <label style={{
                            padding: "10px 15px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#64748b"
                        }}>
                            📎
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                style={{ display: "none" }}
                            />
                        </label>
                    )}
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        placeholder="Type a message..."
                        style={{
                            flex: 1,
                            padding: "10px 15px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            outline: "none"
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() && !fileInput}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            cursor: (!newMessage.trim() && !fileInput) ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            opacity: (!newMessage.trim() && !fileInput) ? 0.5 : 1
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

