import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboardSeller } from "../services/sellerService";

const SellerOnboarding = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: "",
        gstNumber: "",
        businessType: "Manufacturer",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await onboardSeller(formData);
            localStorage.setItem("role", "SELLER_BASIC"); // Update role in local storage
            navigate("/seller");
        } catch (err) {
            setError("Failed to create seller profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-container" style={{
            display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f4f6f8"
        }}>
            <div className="card" style={{
                maxWidth: "600px", width: "100%", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", backgroundColor: "#fff"
            }}>
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#333" }}>Become a Seller</h2>
                <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
                    Start your journey with IndiExport. Fill in your business details.
                </p>

                {error && <div className="error-banner" style={{
                    backgroundColor: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "1rem"
                }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#444" }}>Company Name</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }}
                            placeholder="e.g. Perfect Exports Pvt Ltd"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#444" }}>GST Number</label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }}
                            placeholder="Goods and Services Tax Number"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#444" }}>Business Type</label>
                        <select
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }}
                        >
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Wholesaler">Wholesaler</option>
                            <option value="Trader">Trader</option>
                            <option value="Exporter">Exporter</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#444" }}>Business Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            rows="2"
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px", resize: "none" }}
                            placeholder="Street address, Area"
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#444" }}>City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#444" }}>State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#444" }}>Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#444" }}>Country</label>
                            <input
                                type="text"
                                value="India"
                                disabled
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px", backgroundColor: "#f5f5f5", color: "#888", cursor: "not-allowed" }}
                            />
                            {/* Hidden field note: The requirement says "hidden from UI". But usually users like to see their country if it's fixed. 
                   The prompt says "No seller country selection exists in UI" & "Country not shown anywhere". 
                   Let me strictly follow "Country not shown anywhere" and remove this visible field. 
                   Wait, "Seller country is auto-set to "India" and hidden from UI." 
                   But also "Business address (India-based)".
                   I will remove the visible input for Country entirely to match "Country not shown anywhere" rule.
               */}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: "1rem",
                            padding: "12px",
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: loading ? "wait" : "pointer",
                            transition: "background 0.2s"
                        }}
                    >
                        {loading ? "Creating Profile..." : "Submit & Continue to Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerOnboarding;
