import { useState, useEffect } from "react";
import { getMyInvoices, downloadInvoicePdf, confirmInvoice, cancelInvoice } from "../services/invoiceService";
import { useNavigate } from "react-router-dom";
import SellerSidebar from "../components/SellerSidebar";

const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

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

    const handleConfirmInvoice = async (id) => {
        if (!window.confirm("Are you sure you want to confirm this invoice? This will deduct stock permanently.")) return;
        try {
            setActionLoading(true);
            await confirmInvoice(id);
            await fetchInvoices();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to confirm invoice");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelInvoice = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this invoice?")) return;
        try {
            setActionLoading(true);
            await cancelInvoice(id);
            await fetchInvoices();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel invoice");
        } finally {
            setActionLoading(false);
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
                <div style={{ marginBottom: "2rem" }}>
                    <h2 style={{ margin: 0 }}>Invoice Management</h2>
                    <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                        View and manage your export invoices
                    </p>
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
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Invoice Number</th>
                                    <th>Product</th>
                                    <th>Buyer</th>
                                    <th>Quantity</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📄</div>
                                            <p style={{ margin: 0 }}>No invoices found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                                    {invoice.invoiceNumber}
                                                </div>
                                            </td>
                                            <td>{invoice.productName}</td>
                                            <td>
                                                <div>{invoice.buyerName}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                    {invoice.buyerCountry}
                                                </div>
                                            </td>
                                            <td>{invoice.quantity} units</td>
                                            <td>
                                                <div style={{ fontWeight: 700, color: "var(--primary)" }}>
                                                    ₹{invoice.totalAmount?.toLocaleString('en-IN') || "0.00"}
                                                </div>
                                                {invoice.convertedAmount && (
                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                                        {invoice.convertedAmount.toFixed(2)} {invoice.convertedCurrency}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${invoice.status === "CONFIRMED" ? "badge-active" :
                                                    invoice.status === "DRAFT" ? "badge-warning" :
                                                        invoice.status === "CANCELLED" ? "badge-error" : "badge-inactive"
                                                    }`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                                    {formatDate(invoice.createdAt)}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                    <button
                                                        onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                                                    >
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/seller/orders/${invoice.orderId}`)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", backgroundColor: "#f1f5f9" }}
                                                    >
                                                        Order
                                                    </button>
                                                    {invoice.status === "DRAFT" && (
                                                        <button
                                                            onClick={() => handleConfirmInvoice(invoice.id)}
                                                            disabled={actionLoading}
                                                            className="btn btn-primary"
                                                            style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", backgroundColor: "#1e40af" }}
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}
                                                    {invoice.status !== "CANCELLED" && (
                                                        <button
                                                            onClick={() => handleCancelInvoice(invoice.id)}
                                                            disabled={actionLoading}
                                                            className="btn btn-secondary"
                                                            style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "#b91c1c" }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceManagement;
