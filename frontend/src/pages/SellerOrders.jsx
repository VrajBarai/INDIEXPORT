import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerOrders } from "../services/orderService";
import SellerSidebar from "../components/SellerSidebar";

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (statusFilter === "ALL") {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(o => o.status === statusFilter));
        }
    }, [statusFilter, orders]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getSellerOrders();
            setOrders(response.data);
            setFilteredOrders(response.data);
        } catch (err) {
            console.error("Fetch seller orders error:", err);
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Order Management</h2>
                        <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                            Track and fulfill your business commitments
                        </p>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                    {[
                        { id: "ALL", label: "All Orders" },
                        { id: "CREATED", label: "New" },
                        { id: "CONFIRMED", label: "Confirmed" },
                        { id: "SHIPPED", label: "Shipped" },
                        { id: "COMPLETED", label: "Completed" },
                        { id: "CANCELLED", label: "Cancelled" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`btn ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ borderRadius: "2rem", fontSize: "14px" }}
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

                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {filteredOrders.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📦</div>
                            <p style={{ margin: 0 }}>No orders found for the selected filter</p>
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={{ textAlign: "left", padding: "15px", fontSize: "12px", color: "#64748b" }}>ORDER ID</th>
                                    <th style={{ textAlign: "left", padding: "15px", fontSize: "12px", color: "#64748b" }}>PRODUCT</th>
                                    <th style={{ textAlign: "left", padding: "15px", fontSize: "12px", color: "#64748b" }}>BUYER</th>
                                    <th style={{ textAlign: "left", padding: "15px", fontSize: "12px", color: "#64748b" }}>TOTAL VALUE</th>
                                    <th style={{ textAlign: "left", padding: "15px", fontSize: "12px", color: "#64748b" }}>STATUS</th>
                                    <th style={{ textAlign: "left", padding: "15px", fontSize: "12px", color: "#64748b" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => {
                                    const statusStyle = getStatusColor(order.status);
                                    const totalValue = order.finalQuantity * order.finalPrice;

                                    return (
                                        <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "15px", fontSize: "14px", fontWeight: "600" }}>{order.orderNumber}</td>
                                            <td style={{ padding: "15px" }}>
                                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{order.productName}</div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>Qty: {order.finalQuantity}</div>
                                            </td>
                                            <td style={{ padding: "15px", fontSize: "14px" }}>{order.buyerName}</td>
                                            <td style={{ padding: "15px", fontSize: "14px", fontWeight: "700" }}>₹{totalValue.toLocaleString("en-IN")}</td>
                                            <td style={{ padding: "15px" }}>
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
                                            </td>
                                            <td style={{ padding: "15px" }}>
                                                <button
                                                    onClick={() => navigate(`/seller/orders/${order.id}`)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: "4px 10px", fontSize: "12px" }}
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerOrders;
