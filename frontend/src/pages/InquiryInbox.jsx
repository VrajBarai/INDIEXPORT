import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyInquiries } from "../services/inquiryService";
import { getSellerProfile } from "../services/sellerService";

const InquiryInbox = () => {
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [seller, setSeller] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterInquiries();
    }, [statusFilter, inquiries]);

    const fetchData = async () => {
        try {
            setError("");
            const [inquiriesRes, sellerRes] = await Promise.all([
                getMyInquiries(),
                getSellerProfile(),
            ]);
            setInquiries(inquiriesRes.data || []);
            setSeller(sellerRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    };

    const filterInquiries = () => {
        if (statusFilter === "ALL") {
            setFilteredInquiries(inquiries);
        } else {
            setFilteredInquiries(inquiries.filter(inq => inq.status === statusFilter));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "NEW":
                return { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" };
            case "REPLIED":
                return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
            case "CLOSED":
                return { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
            default:
                return { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isAdvanced = seller?.sellerMode === "ADVANCED";
    const newCount = inquiries.filter(i => i.status === "NEW").length;
    const repliedCount = inquiries.filter(i => i.status === "REPLIED").length;

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <div style={{ fontSize: "18px" }}>Loading Inquiries...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <div>
                        <h2 style={{ color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                            Inquiry Inbox
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
                            Manage buyer inquiries for your products
                        </p>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: statusFilter === "ALL" ? "#2563eb" : "#fff",
                            color: statusFilter === "ALL" ? "#fff" : "#64748b",
                            cursor: "pointer",
                            fontWeight: "600",
                            border: statusFilter === "ALL" ? "none" : "1px solid #e2e8f0",
                            boxShadow: statusFilter === "ALL" ? "0 2px 4px rgba(37, 99, 235, 0.2)" : "none"
                        }}
                    >
                        All ({inquiries.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter("NEW")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: statusFilter === "NEW" ? "#2563eb" : "#fff",
                            color: statusFilter === "NEW" ? "#fff" : "#64748b",
                            cursor: "pointer",
                            fontWeight: "600",
                            border: statusFilter === "NEW" ? "none" : "1px solid #e2e8f0",
                            boxShadow: statusFilter === "NEW" ? "0 2px 4px rgba(37, 99, 235, 0.2)" : "none"
                        }}
                    >
                        New ({newCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter("REPLIED")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: statusFilter === "REPLIED" ? "#2563eb" : "#fff",
                            color: statusFilter === "REPLIED" ? "#fff" : "#64748b",
                            cursor: "pointer",
                            fontWeight: "600",
                            border: statusFilter === "REPLIED" ? "none" : "1px solid #e2e8f0",
                            boxShadow: statusFilter === "REPLIED" ? "0 2px 4px rgba(37, 99, 235, 0.2)" : "none"
                        }}
                    >
                        Replied ({repliedCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter("CLOSED")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: statusFilter === "CLOSED" ? "#2563eb" : "#fff",
                            color: statusFilter === "CLOSED" ? "#fff" : "#64748b",
                            cursor: "pointer",
                            fontWeight: "600",
                            border: statusFilter === "CLOSED" ? "none" : "1px solid #e2e8f0",
                            boxShadow: statusFilter === "CLOSED" ? "0 2px 4px rgba(37, 99, 235, 0.2)" : "none"
                        }}
                    >
                        Closed ({inquiries.filter(i => i.status === "CLOSED").length})
                    </button>
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

            {/* Inquiries List */}
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
                {filteredInquiries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                        <div style={{ fontSize: "40px", marginBottom: "10px" }}>📬</div>
                        <p style={{ margin: 0 }}>No inquiries found</p>
                    </div>
                ) : (
                    <div>
                        {filteredInquiries.map((inquiry) => {
                            const statusStyle = getStatusColor(inquiry.status);
                            return (
                                <div
                                    key={inquiry.id}
                                    onClick={() => navigate(`/seller/inquiries/${inquiry.id}`)}
                                    style={{
                                        padding: "20px",
                                        borderBottom: "1px solid #f1f5f9",
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "16px" }}>
                                                {inquiry.productName}
                                            </h3>
                                            <span style={{
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.color,
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                border: `1px solid ${statusStyle.border}`
                                            }}>
                                                {inquiry.status}
                                            </span>
                                        </div>
                                        <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "4px" }}>
                                            <strong>Buyer:</strong> {inquiry.buyerName} • {inquiry.buyerCountry}
                                        </div>
                                        <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "4px" }}>
                                            <strong>Quantity:</strong> {inquiry.requestedQuantity} units
                                            {inquiry.shippingOption && ` • Shipping: ${inquiry.shippingOption}`}
                                        </div>
                                        <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                                            {formatDate(inquiry.createdAt)}
                                        </div>
                                    </div>
                                    <div style={{ color: "#94a3b8", fontSize: "24px" }}>→</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InquiryInbox;



