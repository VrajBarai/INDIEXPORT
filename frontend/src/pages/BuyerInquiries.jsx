import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBuyerInquiries, deleteInquiry, updateInquiry } from "../services/inquiryService";
import ChatWindow from "../components/ChatWindow";

const BuyerInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showChatId, setShowChatId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getBuyerInquiries();
            setInquiries(response.data);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this inquiry?")) return;

        try {
            await deleteInquiry(id);
            fetchInquiries();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete inquiry");
        }
    };

    const handleEdit = (inquiry) => {
        setEditingId(inquiry.id);
        setEditData({
            message: inquiry.message,
            shippingOption: inquiry.shippingOption || "Courier"
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            setError("");
            await updateInquiry(id, editData);
            setEditingId(null);
            fetchInquiries();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update inquiry");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return { bg: "#dbeafe", color: "#1e40af" };
            case "NEGOTIATING": return { bg: "#dcfce7", color: "#166534" };
            case "CONVERTED": return { bg: "#fef9c3", color: "#854d0e" };
            case "CLOSED": return { bg: "#f3f4f6", color: "#6b7280" };
            default: return { bg: "#f3f4f6", color: "#6b7280" };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
                <div>Loading inquiries...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ margin: 0, color: "#1e293b" }}>My Inquiries</h2>
                    <button
                        onClick={() => navigate("/products/browse")}
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
                        Browse Products
                    </button>
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

                {inquiries.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📧</div>
                        <p style={{ fontSize: "18px", color: "#64748b" }}>No inquiries sent yet</p>
                        <button
                            onClick={() => navigate("/products/browse")}
                            style={{
                                marginTop: "20px",
                                padding: "12px 24px",
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {inquiries.map((inquiry) => {
                            const statusStyle = getStatusColor(inquiry.status);
                            const isEditing = editingId === inquiry.id;
                            const canEdit = inquiry.status === "OPEN";

                            return (
                                <div
                                    key={inquiry.id}
                                    style={{
                                        backgroundColor: "#fff",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: "0 0 5px", color: "#1e293b" }}>{inquiry.productName}</h3>
                                            <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
                                                Seller: {inquiry.sellerBusinessName}
                                            </p>
                                        </div>
                                        <span style={{
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.color,
                                            padding: "6px 12px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "600"
                                        }}>
                                            {inquiry.status}
                                        </span>
                                    </div>

                                    {isEditing ? (
                                        <div style={{ marginTop: "15px" }}>
                                            {/* Quantity Removed from Edit */}
                                            <div style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                                    Shipping Option
                                                </label>
                                                <select
                                                    value={editData.shippingOption}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        shippingOption: e.target.value
                                                    })}
                                                    style={{
                                                        width: "100%",
                                                        padding: "8px",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "6px"
                                                    }}
                                                >
                                                    <option value="Courier">Courier</option>
                                                    <option value="Air Freight">Air Freight</option>
                                                    <option value="Sea Freight">Sea Freight</option>
                                                    <option value="Pickup">Pickup</option>
                                                </select>
                                            </div>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <button
                                                    onClick={() => handleSaveEdit(inquiry.id)}
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#10b981",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    style={{
                                                        padding: "8px 16px",
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
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ marginTop: "15px", fontSize: "14px", color: "#64748b" }}>
                                                {/* Quantity Removed from View */}
                                                {inquiry.shippingOption && (
                                                    <div><strong>Shipping:</strong> {inquiry.shippingOption}</div>
                                                )}
                                                <div style={{ marginTop: "10px", fontSize: "12px" }}>
                                                    Last Updated: {formatDate(inquiry.updatedAt || inquiry.createdAt)}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: "10px", marginTop: "15px", borderTop: "1px solid #f1f5f9", paddingTop: "15px" }}>
                                                {canEdit && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(inquiry)}
                                                            className="btn btn-secondary"
                                                            style={{
                                                                padding: "6px 12px",
                                                                fontSize: "13px"
                                                            }}
                                                        >
                                                            Edit Inquiry
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(inquiry.id)}
                                                            className="btn btn-danger"
                                                            style={{
                                                                padding: "6px 12px",
                                                                fontSize: "13px"
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => setShowChatId(inquiry.id)}
                                                    className="btn btn-primary"
                                                    style={{
                                                        padding: "6px 12px",
                                                        fontSize: "13px",
                                                        marginLeft: canEdit ? "auto" : "0"
                                                    }}
                                                >
                                                    Open Chat
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {showChatId && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.7)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        width: "90%",
                        maxWidth: "800px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}>
                        <ChatWindow inquiryId={showChatId} onClose={() => setShowChatId(null)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerInquiries;
