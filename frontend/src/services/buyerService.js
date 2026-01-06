import api from "./api";

export const getBuyerProfile = () => {
    return api.get("/buyer/profile");
};

export const updateBuyerProfile = (profileData) => {
    return api.put("/buyer/profile", profileData);
};

export const createBuyerProfile = (profileData) => {
    return api.post("/buyer/profile", profileData);
};

export const getAvailableCurrencies = () => {
    return api.get("/buyer/currencies");
};

