import api from "./api";

export const onboardSeller = (data) => {
    return api.post("/seller/onboard", data);
};

export const getSellerProfile = () => {
    return api.get("/seller/profile");
};

export const updateSellerProfile = (data) => {
    return api.put("/seller/profile", data);
};

export const getSellerAnalytics = () => {
    return api.get("/analytics/seller");
};