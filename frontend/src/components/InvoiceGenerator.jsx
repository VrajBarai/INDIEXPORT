import { useState } from "react";
import { generateInvoice, confirmInvoice } from "../services/invoiceService";

const InvoiceGenerator = ({ inquiry, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        shippingCost: "",
        shippingMethod: inquiry?.shippingOption || "",
        convertedCurrency: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [invoice, setInvoice] = useState(null);

    const handleGenerate = async () => {
        try {
            setError("");
            setLoading(true);
            const res = await generateInvoice({
                inquiryId: inquiry.id,
                shippingCost: formData.shippingCost ? parseFloat(formData.shippingCost) : 0,
                shippingMethod: formData.shippingMethod,
                convertedCurrency: formData.convertedCurrency || null,
            });
            setInvoice(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate invoice");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        try {
            setError("");
            setLoading(true);
            await confirmInvoice(invoice.id);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to confirm invoice");
        } finally {
            setLoading(false);
        }
    };

    if (invoice) {
        return (
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
                    width: "600px",
                    maxWidth: "95%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                }}>
                    <h3 style={{ marginTop: 0, color: "#1e293b" }}>Invoice Preview</h3>
                    
                    <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                        <div style={{ fontSize: "18px", fontWeight: "600", color: "#2563eb", marginBottom: "10px" }}>
                            {invoice.invoiceNumber}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
                            <div>
                                <strong>Product:</strong> {invoice.productName}
                            </div>
                            <div>
                                <strong>Quantity:</strong> {invoice.quantity} units
                            </div>
                            <div>
                                <strong>Unit Price:</strong> ₹{invoice.unitPrice?.toLocaleString('en-IN')}
                            </div>
                            <div>
                                <strong>Subtotal:</strong> ₹{invoice.totalPrice?.toLocaleString('en-IN')}
                            </div>
                            {invoice.shippingCost > 0 && (
                                <>
                                    <div>
                                        <strong>Shipping:</strong> ₹{invoice.shippingCost?.toLocaleString('en-IN')}
                                    </div>
                                    <div>
                                        <strong>Method:</strong> {invoice.shippingMethod}
                                    </div>
                                </>
                            )}
                            <div style={{ gridColumn: "1 / -1", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                                <strong style={{ fontSize: "16px" }}>Total Amount: ₹{invoice.totalAmount?.toLocaleString('en-IN')}</strong>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: "#fef2f2",
                            color: "#b91c1c",
                            padding: "10px",
                            borderRadius: "6px",
                            marginBottom: "15px",
                            fontSize: "14px"
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                            onClick={() => {
                                setInvoice(null);
                                setError("");
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
                            Back
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#2563eb",
                                color: "#fff",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontWeight: "600",
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? "Confirming..." : "Confirm Invoice"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
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
                <h3 style={{ marginTop: 0, color: "#1e293b" }}>Generate Invoice</h3>
                
                {error && (
                    <div style={{
                        backgroundColor: "#fef2f2",
                        color: "#b91c1c",
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "15px",
                        fontSize: "14px"
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                            Shipping Method
                        </label>
                        <input
                            type="text"
                            value={formData.shippingMethod}
                            onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                fontSize: "14px",
                                boxSizing: "border-box"
                            }}
                            placeholder="e.g., Air Freight, Sea Freight"
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                            Shipping Cost (₹)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.shippingCost}
                            onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                fontSize: "14px",
                                boxSizing: "border-box"
                            }}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                            Convert to Currency (Optional)
                        </label>
                        <select
                            value={formData.convertedCurrency}
                            onChange={(e) => setFormData({ ...formData, convertedCurrency: e.target.value })}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                fontSize: "14px",
                                boxSizing: "border-box"
                            }}
                        >
                            <option value="">None</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                    <button
                        onClick={onClose}
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
                        onClick={handleGenerate}
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            opacity: loading ? 0.5 : 1
                        }}
                    >
                        {loading ? "Generating..." : "Generate Invoice"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;




