import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableRFQs } from "../services/rfqService";
import { getSellerProfile } from "../services/sellerService";

const RFQListing = () => {
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [seller, setSeller] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setError("");
            const [rfqsRes, sellerRes] = await Promise.all([
                getAvailableRFQs(),
                getSellerProfile(),
            ]);
            setRfqs(rfqsRes.data || []);
            setSeller(sellerRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load RFQs");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays > 0;
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        return expiry < today;
    };

    const isAdvanced = seller?.sellerMode === "ADVANCED";

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <div style={{ fontSize: "18px" }}>Loading RFQs...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                            Request for Quotation (RFQ)
                            {isAdvanced && (
                                <span style={{
                                    backgroundColor: "#fef3c7",
                                    color: "#92400e",
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    border: "1px solid #fcd34d"
                                }}>
                                    PRIORITY SELLER
                                </span>
                            )}
                        </h2>
                        <p style={{ color: "#64748b", margin: "5px 0 0" }}>
                            Browse buyer requirements and submit your quotations
                        </p>
                    </div>
                </div>
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

            {/* RFQs List */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: "20px"
            }}>
                {rfqs.length === 0 ? (
                    <div style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "60px",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0"
                    }}>
                        <div style={{ fontSize: "40px", marginBottom: "10px" }}>📋</div>
                        <p style={{ margin: 0, color: "#94a3b8" }}>No RFQs available at the moment</p>
                    </div>
                ) : (
                    rfqs.map((rfq) => {
                        const expiringSoon = isExpiringSoon(rfq.expiryDate);
                        const expired = isExpired(rfq.expiryDate);

                        return (
                            <div
                                key={rfq.id}
                                onClick={() => navigate(`/seller/rfqs/${rfq.id}`)}
                                style={{
                                    backgroundColor: "#fff",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    padding: "20px",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    position: "relative"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                                }}
                            >
                                {rfq.hasResponded && (
                                    <div style={{
                                        position: "absolute",
                                        top: "15px",
                                        right: "15px",
                                        backgroundColor: "#dcfce7",
                                        color: "#166534",
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: "600"
                                    }}>
                                        Responded
                                    </div>
                                )}

                                {expiringSoon && !expired && (
                                    <div style={{
                                        position: "absolute",
                                        top: "15px",
                                        left: "15px",
                                        backgroundColor: "#fef3c7",
                                        color: "#92400e",
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: "600"
                                    }}>
                                        Expiring Soon
                                    </div>
                                )}

                                <h3 style={{
                                    color: "#1e293b",
                                    marginTop: 0,
                                    marginBottom: "12px",
                                    fontSize: "18px",
                                    fontWeight: "600"
                                }}>
                                    {rfq.productRequirement}
                                </h3>

                                <div style={{ marginBottom: "15px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Quantity:</span>
                                        <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>
                                            {rfq.quantity} units
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Delivery Country:</span>
                                        <span style={{ fontSize: "14px", color: "#1e293b" }}>
                                            {rfq.deliveryCountry}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Buyer:</span>
                                        <span style={{ fontSize: "14px", color: "#1e293b" }}>
                                            {rfq.buyerName} ({rfq.buyerCountry})
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Expires:</span>
                                        <span style={{
                                            fontSize: "14px",
                                            color: expired ? "#ef4444" : expiringSoon ? "#f59e0b" : "#10b981",
                                            fontWeight: "600"
                                        }}>
                                            {formatDate(rfq.expiryDate)}
                                        </span>
                                    </div>
                                </div>

                                {rfq.description && (
                                    <div style={{
                                        backgroundColor: "#f8fafc",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        marginBottom: "15px",
                                        fontSize: "13px",
                                        color: "#475569",
                                        maxHeight: "80px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {rfq.description}
                                    </div>
                                )}

                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingTop: "15px",
                                    borderTop: "1px solid #f1f5f9"
                                }}>
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                        {rfq.responseCount || 0} responses
                                    </span>
                                    <span style={{ color: "#2563eb", fontSize: "14px", fontWeight: "600" }}>
                                        View Details →
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RFQListing;



