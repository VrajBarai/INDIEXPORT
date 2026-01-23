import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../services/authService";
import { getBuyerProfile } from "../services/buyerService";
import { getBuyerInquiries } from "../services/inquiryService";
import { getAvailableRFQs } from "../services/rfqService";
import { getBuyerChatRooms } from "../services/chatService";

const BuyerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [inquiries, setInquiries] = useState([]);
    const [rfqs, setRfqs] = useState([]);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setError("");
            const [profileRes, inquiriesRes, rfqsRes, chatsRes] = await Promise.all([
                getBuyerProfile().catch(() => ({ data: null })),
                getBuyerInquiries().catch(() => ({ data: [] })),
                getAvailableRFQs().catch(() => ({ data: [] })),
                getBuyerChatRooms().catch(() => ({ data: [] }))
            ]);

            setProfile(profileRes.data);
            setInquiries(inquiriesRes.data || []);
            setRfqs(rfqsRes.data || []);
            setChats(chatsRes.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return { bg: "#dbeafe", color: "#1e40af" };
            case "NEGOTIATING": return { bg: "#dcfce7", color: "#166534" };
            case "CONVERTED": return { bg: "#fef9c3", color: "#854d0e" };
            default: return { bg: "#f3f4f6", color: "#6b7280" };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    if (loading) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
                <div style={{ fontSize: "18px", marginBottom: "10px" }}>Loading Buyer Dashboard...</div>
                <div style={{ fontSize: "14px", color: "#94a3b8" }}>Please wait</div>
            </div>
        );
    }

    const recentInquiries = inquiries.slice(0, 5);
    const recentRFQs = rfqs.slice(0, 5);
    const recentChats = chats.slice(0, 5);

    return (
        <div className="dashboard-container" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            {/* Sidebar */}
            <div className="sidebar" style={{
                width: "250px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRight: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}>
                <div>
                    <h3 style={{ color: "#1976d2", marginBottom: "20px", fontSize: "20px" }}>IndiExport Buyer</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li style={{ padding: "10px", backgroundColor: "#e3f2fd", borderRadius: "6px", color: "#1976d2", fontWeight: "600" }}>Dashboard</li>
                        <li style={{ padding: "10px", marginTop: "5px" }}>
                            <Link to="/buyer/profile" style={{ color: "#666", textDecoration: "none" }}>Profile</Link>
                        </li>
                        <li style={{ padding: "10px", marginTop: "5px" }}>
                            <Link to="/products/browse" style={{ color: "#666", textDecoration: "none" }}>Browse Products</Link>
                        </li>
                        <li style={{ padding: "10px", marginTop: "5px" }}>
                            <Link to="/buyer/inquiries" style={{ color: "#666", textDecoration: "none" }}>My Inquiries</Link>
                        </li>
                        <li style={{ padding: "10px", marginTop: "5px" }}>
                            <Link to="/buyer/orders" style={{ color: "#666", textDecoration: "none" }}>My Orders</Link>
                        </li>
                        <li style={{ padding: "10px", marginTop: "5px" }}>
                            <Link to="/buyer/rfqs" style={{ color: "#666", textDecoration: "none" }}>My RFQs</Link>
                        </li>
                    </ul>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#d32f2f",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        marginTop: "20px"
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="main-content" style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
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

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <div>
                        <h2 style={{ color: "#1e293b", margin: 0, fontSize: "28px" }}>Buyer Dashboard</h2>
                        <p style={{ color: "#64748b", margin: "5px 0 0", fontSize: "14px" }}>
                            Welcome back, {profile?.name || "Buyer"}!
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                    <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: "600" }}>SENT INQUIRIES</div>
                        <div style={{ fontSize: "32px", fontWeight: "700", color: "#1e293b" }}>{inquiries.length}</div>
                    </div>
                    <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: "600" }}>RFQs POSTED</div>
                        <div style={{ fontSize: "32px", fontWeight: "700", color: "#1e293b" }}>{rfqs.length}</div>
                    </div>
                    <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: "600" }}>MY ORDERS</div>
                        <div style={{ fontSize: "32px", fontWeight: "700", color: "#1e293b" }}>{/* Optional: Add order count */} - </div>
                    </div>
                    <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: "600" }}>ACTIVE CHATS</div>
                        <div style={{ fontSize: "32px", fontWeight: "700", color: "#1e293b" }}>{chats.length}</div>
                    </div>
                </div>

                {/* Profile Card */}
                <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
                    <h3 style={{ marginTop: 0, color: "#1e293b", marginBottom: "20px" }}>Profile Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>Name</label>
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>{profile?.name || "N/A"}</div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>Email</label>
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>{profile?.email || "N/A"}</div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>Role</label>
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>{profile?.role || "BUYER"}</div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>Status</label>
                            <div style={{ padding: "10px", fontSize: "14px", color: "#1e293b" }}>{profile?.status || "ACTIVE"}</div>
                        </div>
                    </div>
                </div>

                {/* Recent Inquiries */}
                <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ margin: 0, color: "#1e293b" }}>Recent Inquiries</h3>
                        {inquiries.length > 5 && (
                            <Link to="/buyer/inquiries" style={{ color: "#1976d2", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                                View All ({inquiries.length})
                            </Link>
                        )}
                    </div>
                    {recentInquiries.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📧</div>
                            <p style={{ margin: 0 }}>No inquiries sent yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {recentInquiries.map((inquiry) => {
                                const statusStyle = getStatusColor(inquiry.status);
                                return (
                                    <div key={inquiry.id} style={{
                                        padding: "16px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        transition: "all 0.2s",
                                        cursor: "pointer"
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>
                                                    {inquiry.productName}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                    Seller: {inquiry.sellerBusinessName}
                                                </div>
                                            </div>
                                            <span style={{
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.color,
                                                padding: "4px 12px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "600"
                                            }}>
                                                {inquiry.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                                            {formatDate(inquiry.createdAt)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent RFQs */}
                <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ margin: 0, color: "#1e293b" }}>Recent RFQs</h3>
                        {rfqs.length > 5 && (
                            <Link to="/buyer/rfqs" style={{ color: "#1976d2", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                                View All ({rfqs.length})
                            </Link>
                        )}
                    </div>
                    {recentRFQs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📋</div>
                            <p style={{ margin: 0 }}>No RFQs posted yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {recentRFQs.map((rfq) => {
                                const statusStyle = getStatusColor(rfq.status);
                                const isExpired = rfq.expiryDate && new Date(rfq.expiryDate) < new Date();
                                return (
                                    <div key={rfq.id} style={{
                                        padding: "16px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        transition: "all 0.2s",
                                        cursor: "pointer"
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>
                                                    {rfq.productRequirement}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                    Quantity: {rfq.quantity} • Delivery: {rfq.deliveryCountry}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                                <span style={{
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.color,
                                                    padding: "4px 12px",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    fontWeight: "600"
                                                }}>
                                                    {rfq.status}
                                                </span>
                                                {rfq.responseCount > 0 && (
                                                    <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
                                                        {rfq.responseCount} response{rfq.responseCount !== 1 ? "s" : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                                            {formatDate(rfq.createdAt)}
                                            {isExpired && <span style={{ color: "#ef4444", marginLeft: "8px" }}>• Expired</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Active Chats */}
                <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ margin: 0, color: "#1e293b" }}>Active Chats</h3>
                        {chats.length > 5 && (
                            <Link to="/buyer/chats" style={{ color: "#1976d2", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                                View All ({chats.length})
                            </Link>
                        )}
                    </div>
                    {recentChats.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
                            <p style={{ margin: 0 }}>No active chats</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {recentChats.map((chat) => (
                                <div key={chat.id} style={{
                                    padding: "16px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    transition: "all 0.2s",
                                    cursor: "pointer"
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>
                                                {chat.sellerBusinessName}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                Product: {chat.productName}
                                            </div>
                                        </div>
                                        {chat.unreadCount > 0 && (
                                            <span style={{
                                                backgroundColor: "#ef4444",
                                                color: "#fff",
                                                padding: "4px 10px",
                                                borderRadius: "50%",
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                minWidth: "24px",
                                                textAlign: "center"
                                            }}>
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                                        {chat.lastMessageAt ? formatDate(chat.lastMessageAt) : formatDate(chat.updatedAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
