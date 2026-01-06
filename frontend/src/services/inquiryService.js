import api from "./api";

export const getMyInquiries = (status = null) => {
    const url = status ? `/inquiries?status=${status}` : "/inquiries";
    return api.get(url);
};

export const getInquiryDetails = (id) => {
    return api.get(`/inquiries/${id}`);
};

export const replyToInquiry = (id, replyData) => {
    return api.post(`/inquiries/${id}/reply`, replyData);
};

export const updateInquiryStatus = (id, status) => {
    return api.put(`/inquiries/${id}/status?status=${status}`);
};

// Buyer endpoints
export const createInquiry = (inquiryData) => {
    return api.post("/inquiries", inquiryData);
};

export const updateInquiry = (id, inquiryData) => {
    return api.put(`/inquiries/${id}`, inquiryData);
};

export const deleteInquiry = (id) => {
    return api.delete(`/inquiries/${id}`);
};



