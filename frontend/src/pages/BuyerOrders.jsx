import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBuyerOrders } from "../services/orderService";

const BuyerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getBuyerOrders();
            setOrders(response.data);
        } catch (err) {
            console.error("Fetch orders error:", err);
            setError(err.response?.data?.message || "Failed to load orders");
        } finally {
            setLoading(false);
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
            month: "short",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
                <div>Loading orders...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ margin: 0, color: "#1e293b" }}>My Orders</h2>
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
                        New Order
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

                {orders.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📦</div>
                        <p style={{ fontSize: "18px", color: "#64748b" }}>No orders placed yet</p>
                        <p style={{ color: "#94a3b8", marginTop: "10px" }}>
                            Once you place an order or convert an inquiry, it will appear here.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {orders.map((order) => {
                            const statusStyle = getStatusColor(order.status);
                            const totalValue = order.finalQuantity * order.finalPrice;

                            return (
                                <div
                                    key={order.id}
                                    style={{
                                        backgroundColor: "#fff",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                        border: "1px solid #e2e8f0"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                                                <h3 style={{ margin: 0, color: "#1e293b" }}>{order.productName}</h3>
                                                <span style={{
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.color,
                                                    padding: "4px 10px",
                                                    borderRadius: "20px",
                                                    fontSize: "11px",
                                                    fontWeight: "700"
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
                                                Seller: <strong>{order.sellerBusinessName}</strong> • Order No: <strong>{order.orderNumber}</strong>
                                            </p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                                                ₹{totalValue.toLocaleString("en-IN")}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        marginTop: "20px",
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                        gap: "20px",
                                        padding: "15px",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "8px"
                                    }}>
                                        <div>
                                            <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Quantity</label>
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>{order.finalQuantity} units</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Unit Price</label>
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>₹{order.finalPrice}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Shipping</label>
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>{order.shippingTerms}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Inquiry Ref</label>
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                                                {order.inquiryId ? `#${order.inquiryId}` : "Direct Order"}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "flex-end" }}>
                                        <button
                                            onClick={() => navigate(`/buyer/invoices`)} // Will update InvoiceManagement later
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "6px",
                                                border: "1px solid #e2e8f0",
                                                backgroundColor: "#fff",
                                                color: "#64748b",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                fontWeight: "600"
                                            }}
                                        >
                                            View Invoice
                                        </button>
                                        <button
                                            onClick={() => navigate(`/buyer/orders/${order.id}`)}
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "6px",
                                                border: "none",
                                                backgroundColor: "#2563eb",
                                                color: "#fff",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                fontWeight: "600"
                                            }}
                                        >
                                            Order Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerOrders;
