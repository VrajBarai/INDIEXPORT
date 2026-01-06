import api from "./api";

export const generateInvoice = (invoiceData) => {
    return api.post("/invoices", invoiceData);
};

export const getMyInvoices = () => {
    return api.get("/invoices");
};

export const getInvoice = (id) => {
    return api.get(`/invoices/${id}`);
};

export const confirmInvoice = (id) => {
    return api.put(`/invoices/${id}/confirm`);
};

export const cancelInvoice = (id) => {
    return api.put(`/invoices/${id}/cancel`);
};

export const downloadInvoicePdf = (id) => {
    return api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
    });
};



