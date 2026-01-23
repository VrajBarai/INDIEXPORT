import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerInquiries } from "../services/inquiryService";
import { getSellerProfile } from "../services/sellerService";
import SellerSidebar from "../components/SellerSidebar";

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
                getSellerInquiries(),
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

    const getStatusClass = (status) => {
        switch (status) {
            case "OPEN": return "badge-info";
            case "NEGOTIATING": return "badge-active";
            case "CONVERTED": return "badge-warning";
            case "CLOSED": return "badge-inactive";
            default: return "badge-inactive";
        }
    };

    const isAdvanced = seller?.sellerMode === "ADVANCED";
    const openCount = inquiries.filter(i => i.status === "OPEN").length;
    const negotiatingCount = inquiries.filter(i => i.status === "NEGOTIATING").length;
    const convertedCount = inquiries.filter(i => i.status === "CONVERTED").length;

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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Inquiry Inbox</h2>
                        <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                            Manage buyer inquiries for your products
                        </p>
                    </div>
                    {isAdvanced && (
                        <div className="badge badge-warning" style={{ border: "1px solid #fcd34d" }}>
                            PRIORITY SELLER
                        </div>
                    )}
                </div>

                {/* Status Filter Tabs */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                    {[
                        { id: "ALL", label: `All (${inquiries.length})` },
                        { id: "OPEN", label: `Open (${openCount})` },
                        { id: "NEGOTIATING", label: `Negotiating (${negotiatingCount})` },
                        { id: "CONVERTED", label: `Converted (${convertedCount})` },
                        { id: "CLOSED", label: `Closed (${inquiries.filter(i => i.status === "CLOSED").length})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`btn ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ borderRadius: "2rem" }}
                        >
                            {tab.label}
                        </button>
                    ))}
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

                {/* Inquiries List */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {filteredInquiries.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📬</div>
                            <p style={{ margin: 0 }}>No inquiries found</p>
                        </div>
                    ) : (
                        <div style={{ divideY: "1px solid var(--border)" }}>
                            {filteredInquiries.map((inquiry) => {
                                const isOpen = inquiry.status === "OPEN";
                                return (
                                    <div
                                        key={inquiry.id}
                                        onClick={() => navigate(`/seller/inquiries/${inquiry.id}`)}
                                        style={{
                                            padding: "1.5rem",
                                            cursor: "pointer",
                                            transition: "background 0.2s",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            borderBottom: "1px solid var(--border)",
                                            backgroundColor: isOpen ? "var(--primary-light)" : "white"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isOpen ? "#dbeafe" : "var(--bg-body)"}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isOpen ? "var(--primary-light)" : "white"}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                                                <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text-main)" }}>
                                                    {inquiry.productName}
                                                </h3>
                                                <span className={`badge ${getStatusClass(inquiry.status)}`}>
                                                    {inquiry.status}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", gap: "1.5rem", color: "var(--text-secondary)", fontSize: "0.875rem", flexWrap: "wrap" }}>
                                                <span>
                                                    <strong>Buyer:</strong> {inquiry.buyerName} • {inquiry.buyerCountry}
                                                </span>
                                                <span>
                                                    <strong>Date:</strong> {formatDate(inquiry.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ color: "var(--primary)", fontSize: "1.25rem" }}>→</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InquiryInbox;
