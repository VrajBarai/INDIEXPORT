import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../services/orderService";

const SellerOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getOrder(id);
            setOrder(response.data);
        } catch (err) {
            console.error("Fetch order error:", err);
            setError(err.response?.data?.message || "Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setUpdating(true);
            setError("");
            setSuccessMessage("");
            const response = await updateOrderStatus(id, { status: newStatus });
            setOrder(response.data);
            setSuccessMessage(`Order status updated to ${newStatus} successfully!`);

            // If confirmed, tell user an invoice was generated
            if (newStatus === "CONFIRMED") {
                setSuccessMessage(`Order status updated to CONFIRMED and Invoice generated automatically!`);
            }

            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (err) {
            console.error("Update status error:", err);
            setError(err.response?.data?.message || "Failed to update order status");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "CREATED": return { bg: "#dbeafe", color: "#1e40af" };
            case "CONFIRMED": return { bg: "#dcfce7", color: "#166534" };
            case "SHIPPED": return { bg: "#fef9c3", color: "#854d0e" };
            case "COMPLETED": return { bg: "#f0fdf4", color: "#15803d" };
            case "CANCELLED": return { bg: "#fef2f2", color: "#b91c1c" };
            default: return { bg: "#f3f4f6", color: "#374151" };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
                <div>Loading order details...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <div style={{
                        backgroundColor: "#fef2f2",
                        color: "#b91c1c",
                        padding: "20px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        border: "1px solid #fee2e2"
                    }}>
                        {error || "Order not found"}
                    </div>
                    <button
                        onClick={() => navigate("/seller/orders")}
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
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const statusStyle = getStatusColor(order.status);

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                {successMessage && (
                    <div style={{
                        backgroundColor: "#f0fdf4",
                        color: "#15803d",
                        padding: "15px 20px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        border: "1px solid #bbfcce",
                        fontWeight: "600"
                    }}>
                        ✅ {successMessage}
                    </div>
                )}

                {error && (
                    <div style={{
                        backgroundColor: "#fef2f2",
                        color: "#b91c1c",
                        padding: "15px 20px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        border: "1px solid #fee2e2"
                    }}>
                        ❌ {error}
                    </div>
                )}
                {/* Header */}
                <div style={{ marginBottom: "30px" }}>
                    <button
                        onClick={() => navigate("/seller/orders")}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#fff",
                            color: "#64748b",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            marginBottom: "15px"
                        }}
                    >
                        ← Back to Orders
                    </button>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h2 style={{ margin: 0, color: "#1e293b" }}>Order #{order.id}</h2>
                            <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>
                                Order Number: <strong>{order.orderNumber}</strong>
                            </p>
                        </div>
                        <span style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "700"
                        }}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Customer & Product Details */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px" }}>Customer & Product Details</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Customer Name</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>{order.buyerName}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Product Name</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>{order.productName}</div>
                        </div>
                    </div>
                </div>

                {/* Order Information */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px" }}>Order Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Quantity</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>{order.finalQuantity} units</div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Unit Price</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>₹{order.finalPrice?.toLocaleString("en-IN")}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Shipping Cost</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>₹{order.shippingCost?.toLocaleString("en-IN")}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Total Amount</label>
                            <div style={{ fontSize: "20px", fontWeight: "700", color: "#16a34a", marginTop: "5px" }}>₹{order.totalAmount?.toLocaleString("en-IN")}</div>
                        </div>
                    </div>
                </div>

                {/* Shipping & Payment */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px" }}>Shipping & Payment</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Shipping Terms</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>{order.shippingTerms || "N/A"}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Currency</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>{order.currency}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Order Date</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>{formatDate(order.createdAt)}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Inquiry Reference</label>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginTop: "5px" }}>
                                {order.inquiryId ? (
                                    <button
                                        onClick={() => navigate(`/seller/inquiries/${order.inquiryId}`)}
                                        style={{
                                            padding: "4px 10px",
                                            backgroundColor: "#2563eb",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        View Inquiry #{order.inquiryId}
                                    </button>
                                ) : "Direct Order"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", flexWrap: "wrap", marginTop: "30px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {order.status === "CREATED" && (
                            <button
                                onClick={() => handleUpdateStatus("CONFIRMED")}
                                disabled={updating}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "#166534",
                                    color: "#fff",
                                    cursor: updating ? "not-allowed" : "pointer",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}
                            >
                                {updating ? "Updating..." : "Confirm Order"}
                            </button>
                        )}
                        {order.status === "CONFIRMED" && (
                            <button
                                onClick={() => handleUpdateStatus("SHIPPED")}
                                disabled={updating}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "#854d0e",
                                    color: "#fff",
                                    cursor: updating ? "not-allowed" : "pointer",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}
                            >
                                {updating ? "Updating..." : "Mark as Shipped"}
                            </button>
                        )}
                        {order.status === "SHIPPED" && (
                            <button
                                onClick={() => handleUpdateStatus("COMPLETED")}
                                disabled={updating}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: "#15803d",
                                    color: "#fff",
                                    cursor: updating ? "not-allowed" : "pointer",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}
                            >
                                {updating ? "Updating..." : "Mark as Completed"}
                            </button>
                        )}
                        {(order.status === "CREATED" || order.status === "CONFIRMED") && (
                            <button
                                onClick={() => handleUpdateStatus("CANCELLED")}
                                disabled={updating}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    border: "1px solid #fecaca",
                                    backgroundColor: "#fff",
                                    color: "#b91c1c",
                                    cursor: updating ? "not-allowed" : "pointer",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}
                            >
                                {updating ? "Cancelling..." : "Cancel Order"}
                            </button>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={() => navigate("/seller/invoices")}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#fff",
                                color: "#64748b",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        >
                            View Invoices
                        </button>
                        <button
                            onClick={() => window.print()}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#334155",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        >
                            Print Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerOrderDetail;
