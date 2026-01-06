import api from "./api";

export const getAvailableRFQs = () => {
    return api.get("/rfqs");
};

export const getRFQDetails = (id) => {
    return api.get(`/rfqs/${id}`);
};

export const respondToRFQ = (id, responseData) => {
    return api.post(`/rfqs/${id}/respond`, responseData);
};

export const getRFQResponses = (id) => {
    return api.get(`/rfqs/${id}/responses`);
};

export const getMyRFQResponses = () => {
    return api.get("/rfqs/my-responses");
};

// Buyer endpoints
export const createRFQ = (rfqData) => {
    return api.post("/rfqs", rfqData);
};

export const updateRFQ = (id, rfqData) => {
    return api.put(`/rfqs/${id}`, rfqData);
};

export const deleteRFQ = (id) => {
    return api.delete(`/rfqs/${id}`);
};



