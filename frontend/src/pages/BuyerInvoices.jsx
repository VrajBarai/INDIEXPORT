import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBuyerInvoices, downloadInvoicePdf } from "../services/invoiceService";

const BuyerInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloadingId, setDownloadingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getBuyerInvoices();
            setInvoices(response.data);
        } catch (err) {
            console.error("Fetch invoices error:", err);
            setError(err.response?.data?.message || "Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (invoiceId) => {
        try {
            setDownloadingId(invoiceId);
            const response = await downloadInvoicePdf(invoiceId);
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = invoices.find(inv => inv.id === invoiceId)?.invoiceNumber || `invoice-${invoiceId}`;
            link.href = url;
            link.setAttribute('download', `${fileName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download invoice. " + (err.response?.data?.message || ""));
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return { bg: "#fef9c3", color: "#854d0e" };
            case "CONFIRMED": return { bg: "#dcfce7", color: "#166534" };
            case "PAID": return { bg: "#f0fdf4", color: "#15803d" };
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
                <div>Loading invoices...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ margin: 0, color: "#1e293b" }}>My Invoices</h2>
                    <button
                        onClick={() => navigate("/buyer/orders")}
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
                        View Orders
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

                {invoices.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📄</div>
                        <p style={{ fontSize: "18px", color: "#64748b" }}>No invoices yet</p>
                        <p style={{ color: "#94a3b8", marginTop: "10px" }}>
                            Invoices will appear here once sellers generate them for your orders.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {invoices.map((invoice) => {
                            const statusStyle = getStatusColor(invoice.status);

                            return (
                                <div
                                    key={invoice.id}
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
                                                <h3 style={{ margin: 0, color: "#1e293b" }}>{invoice.invoiceNumber}</h3>
                                                <span style={{
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.color,
                                                    padding: "4px 10px",
                                                    borderRadius: "20px",
                                                    fontSize: "11px",
                                                    fontWeight: "700"
                                                }}>
                                                    {invoice.status}
                                                </span>
                                            </div>
                                            <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
                                                Order No: <strong>{invoice.orderNumber || `#${invoice.orderId}`}</strong>
                                                {invoice.inquiryId && ` • Inquiry ID: #${invoice.inquiryId}`}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                                                ₹{invoice.totalAmount?.toLocaleString("en-IN")}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                {formatDate(invoice.createdAt)}
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
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>{invoice.quantity} units</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Unit Price</label>
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>₹{invoice.unitPrice?.toLocaleString("en-IN")}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Shipping</label>
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>₹{invoice.shippingCost?.toLocaleString("en-IN")}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Tax</label>
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>₹{invoice.tax?.toLocaleString("en-IN")}</div>
                                        </div>
                                    </div>

                                    {invoice.notes && (
                                        <div style={{
                                            marginTop: "15px",
                                            padding: "12px",
                                            backgroundColor: "#fef9c3",
                                            borderRadius: "6px",
                                            fontSize: "13px",
                                            color: "#854d0e"
                                        }}>
                                            <strong>Notes:</strong> {invoice.notes}
                                        </div>
                                    )}

                                    <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "flex-end" }}>
                                        <button
                                            onClick={() => navigate(`/buyer/orders/${invoice.orderId}`)}
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
                                            View Order
                                        </button>
                                        <button
                                            onClick={() => handleDownloadPdf(invoice.id)}
                                            disabled={downloadingId === invoice.id}
                                            style={{
                                                padding: "8px 16px",
                                                borderRadius: "6px",
                                                border: "none",
                                                backgroundColor: downloadingId === invoice.id ? "#94a3b8" : "#2563eb",
                                                color: "#fff",
                                                cursor: downloadingId === invoice.id ? "not-allowed" : "pointer",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px"
                                            }}
                                        >
                                            {downloadingId === invoice.id ? "Downloading..." : "Download PDF"}
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

export default BuyerInvoices;
