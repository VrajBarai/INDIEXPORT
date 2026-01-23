import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInquiryDetails, replyToInquiry, closeInquiry } from "../services/inquiryService";
import { createOrderFromInquiry } from "../services/orderService";
import ChatWindow from "../components/ChatWindow";

const InquiryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderData, setOrderData] = useState({
        finalQuantity: "",
        finalPrice: "",
        shippingTerms: "FOB"
    });
    const [replyMessage, setReplyMessage] = useState("");

    useEffect(() => {
        fetchInquiry();
    }, [id]);

    const fetchInquiry = async () => {
        try {
            setError("");
            const res = await getInquiryDetails(id);
            setInquiry(res.data);
            setOrderData(prev => ({
                ...prev,
                finalQuantity: "",
                finalPrice: res.data.productPrice || ""
            }));
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load inquiry details");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) {
            setError("Please enter a reply message");
            return;
        }

        try {
            setError("");
            await replyToInquiry(id, { replyMessage });
            setSuccess("Reply sent successfully");
            setShowReplyModal(false);
            setReplyMessage("");
            fetchInquiry();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reply");
        }
    };

    const handleCloseInquiry = async () => {
        try {
            setError("");
            await closeInquiry(id);
            setSuccess("Inquiry closed successfully");
            fetchInquiry();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to close inquiry");
        }
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            setError("");
            await createOrderFromInquiry(id, {
                finalQuantity: parseInt(orderData.finalQuantity),
                finalPrice: parseFloat(orderData.finalPrice),
                currency: "INR",
                shippingTerms: orderData.shippingTerms,
                shippingCost: 500 // Fixed shipping cost placeholder
            });
            setSuccess("Order created successfully!");
            setShowOrderModal(false);
            fetchInquiry();
            setTimeout(() => setSuccess(""), 3000);
            navigate("/seller/orders");
        } catch (err) {
            console.error("Order error:", err);
            setError(err.response?.data?.message || "Failed to create order");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN":
                return { bg: "#dbeafe", color: "#1e40af" };
            case "NEGOTIATING":
                return { bg: "#dcfce7", color: "#166534" };
            case "CONVERTED":
                return { bg: "#fef9c3", color: "#854d0e" };
            case "CLOSED":
                return { bg: "#f3f4f6", color: "#374151" };
            default:
                return { bg: "#f3f4f6", color: "#374151" };
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <div style={{ fontSize: "18px" }}>Loading Inquiry Details...</div>
            </div>
        );
    }

    if (!inquiry) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <div style={{ fontSize: "18px" }}>Inquiry not found</div>
            </div>
        );
    }

    const statusStyle = getStatusColor(inquiry.status);

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <button
                        onClick={() => navigate("/seller/inquiries")}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#fff",
                            color: "#64748b",
                            cursor: "pointer",
                            marginBottom: "15px",
                            fontWeight: "600"
                        }}
                    >
                        ← Back to Inbox
                    </button>
                    <h2 style={{ color: "#1e293b", margin: 0 }}>Inquiry Details</h2>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600"
                    }}>
                        {inquiry.status}
                    </span>
                    {inquiry.status !== "CLOSED" && inquiry.status !== "CONVERTED" && (
                        <button
                            onClick={() => setShowReplyModal(true)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#2563eb",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Reply
                        </button>
                    )}
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

            {success && (
                <div style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    border: "1px solid #86efac"
                }}>
                    {success}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                {/* Main Content */}
                <div>
                    {/* Product Info */}
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        padding: "25px",
                        marginBottom: "20px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>Product Information</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Product Name</label>
                                <div style={{ fontSize: "16px", color: "#1e293b", fontWeight: "600", marginTop: "4px" }}>
                                    {inquiry.productName}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Category</label>
                                <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                                    {inquiry.productCategory || "N/A"}
                                </div>
                            </div>
                            {/* Quantity Removed */}
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Shipping Option</label>
                                <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                                    {inquiry.shippingOption || "Not specified"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buyer Info */}
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        padding: "25px",
                        marginBottom: "20px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>Buyer Information</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Name</label>
                                <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px" }}>
                                    {inquiry.buyerName}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Email</label>
                                <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                                    {inquiry.buyerEmail}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Country</label>
                                <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                                    {inquiry.buyerCountry || "Not specified"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {inquiry.message && (
                        <div style={{
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            padding: "25px",
                            marginBottom: "20px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                            <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>Messages</h3>
                            <div style={{
                                backgroundColor: "#f8fafc",
                                padding: "15px",
                                borderRadius: "8px",
                                whiteSpace: "pre-wrap",
                                fontSize: "14px",
                                color: "#475569",
                                lineHeight: "1.6"
                            }}>
                                {inquiry.message}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    {/* Actions */}
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        padding: "25px",
                        marginBottom: "20px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>Actions</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {inquiry.status !== "CLOSED" && inquiry.status !== "CONVERTED" && (
                                <>
                                    <button
                                        onClick={handleCloseInquiry}
                                        style={{
                                            padding: "10px",
                                            borderRadius: "6px",
                                            border: "1px solid #e2e8f0",
                                            backgroundColor: "#fff",
                                            color: "#64748b",
                                            cursor: "pointer",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Close Inquiry
                                    </button>
                                    <button
                                        onClick={() => setShowOrderModal(true)}
                                        style={{
                                            padding: "10px",
                                            borderRadius: "6px",
                                            border: "none",
                                            backgroundColor: "#10b981",
                                            color: "#fff",
                                            cursor: "pointer",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Create Order
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowChat(true)}
                                style={{
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #2563eb",
                                    backgroundColor: "#fff",
                                    color: "#2563eb",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                Open Chat
                            </button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        padding: "25px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>Timeline</h3>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                            <div style={{ marginBottom: "10px" }}>
                                <strong>Created:</strong> {formatDate(inquiry.createdAt)}
                            </div>
                            {inquiry.updatedAt && (
                                <div>
                                    <strong>Last Updated:</strong> {formatDate(inquiry.updatedAt)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reply Modal */}
            {showReplyModal && (
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
                        backgroundColor: "#fff",
                        padding: "30px",
                        borderRadius: "16px",
                        width: "500px",
                        maxWidth: "95%",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}>
                        <h3 style={{ marginTop: 0, color: "#1e293b", fontSize: "20px" }}>Reply to Inquiry</h3>
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Enter your reply message..."
                            rows="6"
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                fontSize: "14px",
                                marginBottom: "20px",
                                resize: "vertical",
                                boxSizing: "border-box"
                            }}
                        />
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => {
                                    setShowReplyModal(false);
                                    setReplyMessage("");
                                }}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    border: "1px solid #e2e8f0",
                                    backgroundColor: "#fff",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReply}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "#2563eb",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Window */}
            {showChat && (
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
                        <ChatWindow inquiryId={inquiry.id} onClose={() => setShowChat(false)} />
                    </div>
                </div>
            )}

            {/* Order Creation Modal */}
            {showOrderModal && (
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
                        backgroundColor: "#fff",
                        padding: "30px",
                        borderRadius: "16px",
                        width: "500px",
                        maxWidth: "95%",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}>
                        <h3 style={{ marginTop: 0, color: "#1e293b", fontSize: "20px" }}>Create Order from Inquiry</h3>
                        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                            Finalize terms and convert this inquiry into a binding order.
                        </p>

                        <form onSubmit={handleCreateOrder}>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>
                                    Final Quantity
                                </label>
                                <input
                                    type="number"
                                    value={orderData.finalQuantity}
                                    onChange={(e) => setOrderData({ ...orderData, finalQuantity: e.target.value })}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>
                                    Final Unit Price (INR)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={orderData.finalPrice}
                                    onChange={(e) => setOrderData({ ...orderData, finalPrice: e.target.value })}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>
                                    Shipping Terms
                                </label>
                                <select
                                    value={orderData.shippingTerms}
                                    onChange={(e) => setOrderData({ ...orderData, shippingTerms: e.target.value })}
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                                >
                                    <option value="FOB">FOB - Free On Board</option>
                                    <option value="CIF">CIF - Cost, Insurance, and Freight</option>
                                    <option value="EXW">EXW - Ex Works</option>
                                    <option value="DDP">DDP - Delivered Duty Paid</option>
                                </select>
                            </div>

                            <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", marginBottom: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "5px" }}>
                                    <span>Product Amount:</span>
                                    <span>₹{(orderData.finalQuantity * orderData.finalPrice || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#166534", marginBottom: "5px" }}>
                                    <span>Shipping Charge:</span>
                                    <span>₹500.00</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#1e293b", fontWeight: "700", borderTop: "1px solid #e2e8f0", paddingTop: "5px" }}>
                                    <span>Total Contract Value:</span>
                                    <span>₹{((orderData.finalQuantity * orderData.finalPrice || 0) + 500).toFixed(2)}</span>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowOrderModal(false)}
                                    style={{ padding: "10px 20px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: "10px 20px", borderRadius: "6px", border: "none", backgroundColor: "#10b981", color: "#fff", cursor: "pointer", fontWeight: "600" }}
                                >
                                    Create Contract Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InquiryDetail;
