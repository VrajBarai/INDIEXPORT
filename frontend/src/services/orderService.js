import api from "./api";

export const createDirectOrder = (orderData) => {
    return api.post("/orders/buyer", orderData);
};

export const createOrderFromInquiry = (inquiryId, orderData) => {
    return api.post(`/orders/seller/from-inquiry/${inquiryId}`, orderData);
};

export const getBuyerOrders = () => {
    return api.get("/orders/buyer");
};

export const getSellerOrders = () => {
    return api.get("/orders/seller");
};

export const getOrder = (id) => {
    return api.get(`/orders/${id}`);
};

export const updateOrderStatus = (id, statusData) => {
    return api.put(`/orders/${id}/status`, statusData);
};
