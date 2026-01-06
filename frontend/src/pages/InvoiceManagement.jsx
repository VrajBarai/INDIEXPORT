import { useState, useEffect } from "react";
import { getMyInvoices, downloadInvoicePdf } from "../services/invoiceService";

const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setError("");
            const res = await getMyInvoices();
            setInvoices(res.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
        try {
            const res = await downloadInvoicePdf(invoiceId);
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Failed to download invoice");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "CONFIRMED":
                return { bg: "#dcfce7", color: "#166534" };
            case "DRAFT":
                return { bg: "#fef3c7", color: "#92400e" };
            case "CANCELLED":
                return { bg: "#fee2e2", color: "#991b1b" };
            default:
                return { bg: "#f3f4f6", color: "#374151" };
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

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <div style={{ fontSize: "18px" }}>Loading Invoices...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ marginBottom: "30px" }}>
                <h2 style={{ color: "#1e293b", margin: 0 }}>Invoice Management</h2>
                <p style={{ color: "#64748b", margin: "5px 0 0" }}>
                    View and manage your export invoices
                </p>
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

            <div style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>Invoice Number</th>
                            <th style={thStyle}>Product</th>
                            <th style={thStyle}>Buyer</th>
                            <th style={thStyle}>Quantity</th>
                            <th style={thStyle}>Total Amount</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>📄</div>
                                    <p style={{ margin: 0 }}>No invoices found</p>
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => {
                                const statusStyle = getStatusColor(invoice.status);
                                return (
                                    <tr
                                        key={invoice.id}
                                        style={{
                                            borderBottom: "1px solid #f1f5f9",
                                            transition: "background 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                                    >
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: "600", color: "#1e293b" }}>
                                                {invoice.invoiceNumber}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>{invoice.productName}</td>
                                        <td style={tdStyle}>
                                            <div>{invoice.buyerName}</div>
                                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                                                {invoice.buyerCountry}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>{invoice.quantity} units</td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: "700", color: "#2563eb" }}>
                                                ₹{invoice.totalAmount?.toLocaleString('en-IN') || "0.00"}
                                            </div>
                                            {invoice.convertedAmount && (
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                    {invoice.convertedAmount.toFixed(2)} {invoice.convertedCurrency}
                                                </div>
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.color,
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "12px",
                                                fontWeight: "600"
                                            }}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: "13px", color: "#475569" }}>
                                                {formatDate(invoice.createdAt)}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    border: "1px solid #2563eb",
                                                    backgroundColor: "#fff",
                                                    color: "#2563eb",
                                                    cursor: "pointer",
                                                    fontWeight: "600",
                                                    fontSize: "13px"
                                                }}
                                            >
                                                Download PDF
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = {
    padding: "16px 20px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.025em"
};

const tdStyle = {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#475569"
};

export default InvoiceManagement;



