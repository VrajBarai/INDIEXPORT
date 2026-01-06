import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBuyerProfile, updateBuyerProfile, createBuyerProfile, getAvailableCurrencies } from "../services/buyerService";
import { getAllCountries } from "../services/productService";

const BuyerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [countries, setCountries] = useState([]);
    const [availableCurrencies, setAvailableCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        country: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        currency: ""
    });

    useEffect(() => {
        fetchProfile();
        fetchCountries();
        fetchCurrencies();
    }, []);

    const fetchProfile = async () => {
        try {
            setError("");
            const response = await getBuyerProfile();
            const buyer = response.data;
            setProfile(buyer);
            setFormData({
                fullName: buyer.fullName || "",
                phone: buyer.phone || "",
                country: buyer.country || "",
                address: buyer.address || "",
                city: buyer.city || "",
                state: buyer.state || "",
                pincode: buyer.pincode || "",
                currency: buyer.currency || ""
            });
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await getAllCountries();
            setCountries(response.data);
        } catch (err) {
            console.error("Failed to load countries:", err);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await getAvailableCurrencies();
            setAvailableCurrencies(response.data || []);
        } catch (err) {
            console.error("Failed to load currencies:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            setError("");
            setSuccess("");

            if (!formData.fullName || !formData.country) {
                setError("Full Name and Country are required");
                return;
            }

            let response;
            if (profile && profile.id) {
                response = await updateBuyerProfile(formData);
            } else {
                response = await createBuyerProfile(formData);
            }

            setProfile(response.data);
            setEditing(false);
            setSuccess("Profile updated successfully!");
        } catch (err) {
            console.error("Save error:", err);
            setError(err.response?.data?.message || "Failed to update profile");
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || "",
                phone: profile.phone || "",
                country: profile.country || "",
                address: profile.address || "",
                city: profile.city || "",
                state: profile.state || "",
                pincode: profile.pincode || "",
                currency: profile.currency || ""
            });
        }
        setEditing(false);
        setError("");
    };

    if (loading) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
                <div>Loading profile...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ margin: 0, color: "#1e293b" }}>Buyer Profile</h2>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {error && (
                    <div style={{
                        backgroundColor: "#fef2f2",
                        color: "#b91c1c",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        border: "1px solid #fee2e2"
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        border: "1px solid #bbf7d0"
                    }}>
                        {success}
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            Full Name / Company Name *
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        ) : (
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>
                                {profile?.fullName || "N/A"}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            Email
                        </label>
                        <div style={{ padding: "10px", fontSize: "14px", color: "#64748b" }}>
                            {profile?.user?.email || "N/A"}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            Phone
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        ) : (
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>
                                {profile?.phone || "N/A"}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            Country *
                        </label>
                        {editing ? (
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>
                                {countries.find(c => c.code === profile?.country)?.name || profile?.country || "N/A"}
                            </div>
                        )}
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            Address
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        ) : (
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>
                                {profile?.address || "N/A"}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            City
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        ) : (
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>
                                {profile?.city || "N/A"}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            State
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        ) : (
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>
                                {profile?.state || "N/A"}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            Pincode
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        ) : (
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>
                                {profile?.pincode || "N/A"}
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                            Preferred Currency
                        </label>
                        {editing ? (
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            >
                                <option value="">Select Currency</option>
                                {availableCurrencies.map((curr) => (
                                    <option key={curr} value={curr}>
                                        {curr}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>
                                {profile?.currency || "N/A"}
                            </div>
                        )}
                    </div>
                </div>

                {editing && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#6b7280",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerProfile;

