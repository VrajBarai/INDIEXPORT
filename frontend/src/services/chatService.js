import api from "./api";

export const getChatRooms = () => {
    return api.get("/chat/rooms");
};

export const getOrCreateChatRoom = (inquiryId) => {
    return api.get(`/chat/rooms/inquiry/${inquiryId}`);
};

export const getChatMessages = (roomId) => {
    return api.get(`/chat/rooms/${roomId}/messages`);
};

export const sendMessage = (roomId, messageData) => {
    return api.post(`/chat/rooms/${roomId}/messages`, messageData);
};

export const markMessagesAsRead = (roomId) => {
    return api.put(`/chat/rooms/${roomId}/read`);
};

// Buyer endpoint
export const getBuyerChatRooms = () => {
    return api.get("/chat/rooms/buyer");
};



