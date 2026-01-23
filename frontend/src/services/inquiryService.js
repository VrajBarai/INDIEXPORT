import api from "./api";

export const getBuyerInquiries = (status) => {
    return api.get("/inquiries/buyer", { params: { status } });
};

export const getSellerInquiries = (status) => {
    return api.get("/inquiries/seller", { params: { status } });
};

export const getInquiryDetails = (id) => {
    return api.get(`/inquiries/${id}`);
};

export const createInquiry = (inquiryData) => {
    return api.post("/inquiries/buyer", inquiryData);
};

export const updateInquiry = (id, inquiryData) => {
    return api.put(`/inquiries/${id}`, inquiryData);
};

export const deleteInquiry = (id) => {
    return api.delete(`/inquiries/${id}`);
};

export const replyToInquiry = (id, replyData) => {
    return api.post(`/inquiries/${id}/reply`, replyData);
};

export const closeInquiry = (id) => {
    return api.patch(`/inquiries/${id}/close`);
};
