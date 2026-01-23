import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableRFQs } from "../services/rfqService";
import { getSellerProfile } from "../services/sellerService";
import SellerSidebar from "../components/SellerSidebar";

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
            <div className="dashboard-container">
                <SellerSidebar />
                <div className="main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <SellerSidebar />

            <div className="main-content">
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Request for Quotation (RFQ)</h2>
                        <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                            Browse buyer requirements and submit your quotations
                        </p>
                    </div>
                    {isAdvanced && (
                        <span className="badge badge-warning" style={{ border: "1px solid #fcd34d" }}>
                            PRIORITY SELLER
                        </span>
                    )}
                </div>

                {error && (
                    <div className="card" style={{
                        backgroundColor: "var(--error-bg)",
                        color: "var(--error-text)",
                        borderColor: "var(--error)",
                        padding: "1rem",
                        marginBottom: "1.5rem"
                    }}>
                        {error}
                    </div>
                )}

                {/* RFQs List */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "1.5rem"
                }}>
                    {rfqs.length === 0 ? (
                        <div className="card" style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            padding: "4rem",
                            color: "var(--text-muted)"
                        }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
                            <p style={{ margin: 0 }}>No RFQs available at the moment</p>
                        </div>
                    ) : (
                        rfqs.map((rfq) => {
                            const expiringSoon = isExpiringSoon(rfq.expiryDate);
                            const expired = isExpired(rfq.expiryDate);

                            return (
                                <div
                                    key={rfq.id}
                                    className="card"
                                    onClick={() => navigate(`/seller/rfqs/${rfq.id}`)}
                                    style={{
                                        cursor: "pointer",
                                        position: "relative",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    {rfq.hasResponded && (
                                        <div style={{
                                            position: "absolute",
                                            top: "1rem",
                                            right: "1rem",
                                        }}>
                                            <span className="badge badge-active">Responded</span>
                                        </div>
                                    )}

                                    {expiringSoon && !expired && (
                                        <div style={{
                                            position: "absolute",
                                            top: "1rem",
                                            left: "1rem",
                                        }}>
                                            <span className="badge badge-warning">Expiring Soon</span>
                                        </div>
                                    )}

                                    <h3 style={{
                                        margin: "0 0 1rem",
                                        fontSize: "1.125rem",
                                        paddingRight: rfq.hasResponded ? "5rem" : "0"
                                    }}>
                                        {rfq.productRequirement}
                                    </h3>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Quantity:</span>
                                            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{rfq.quantity} units</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Destination:</span>
                                            <span style={{ fontSize: "0.875rem" }}>{rfq.deliveryCountry}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Buyer:</span>
                                            <span style={{ fontSize: "0.875rem" }}>{rfq.buyerName} ({rfq.buyerCountry})</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Expires:</span>
                                            <span style={{
                                                fontSize: "0.875rem",
                                                color: expired ? "var(--error)" : expiringSoon ? "var(--warning)" : "var(--success)",
                                                fontWeight: 600
                                            }}>
                                                {formatDate(rfq.expiryDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {rfq.description && (
                                        <div style={{
                                            backgroundColor: "var(--bg-body)",
                                            padding: "0.75rem",
                                            borderRadius: "var(--radius-md)",
                                            marginBottom: "1rem",
                                            fontSize: "0.875rem",
                                            color: "var(--text-secondary)",
                                            flex: 1,
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical"
                                        }}>
                                            {rfq.description}
                                        </div>
                                    )}

                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: "auto",
                                        paddingTop: "1rem",
                                        borderTop: "1px solid var(--border)"
                                    }}>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                            {rfq.responseCount || 0} responses
                                        </span>
                                        <span style={{ color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default RFQListing;
