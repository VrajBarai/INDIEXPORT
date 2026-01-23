import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRFQDetails, respondToRFQ, getRFQResponses } from "../services/rfqService";
import { getSellerProfile } from "../services/sellerService";

const RFQDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rfq, setRfq] = useState(null);
    const [responses, setResponses] = useState([]);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseData, setResponseData] = useState({
        offeredPrice: "",
        estimatedDeliveryTime: "",
        message: "",
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setError("");
            const [rfqRes, sellerRes, responsesRes] = await Promise.all([
                getRFQDetails(id),
                getSellerProfile(),
                getRFQResponses(id).catch(() => ({ data: [] })), // Optional, may fail if no access
            ]);
            setRfq(rfqRes.data);
            setSeller(sellerRes.data);
            setResponses(responsesRes.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load RFQ details");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitResponse = async () => {
        if (!responseData.offeredPrice || !responseData.estimatedDeliveryTime) {
            setError("Please fill in all required fields");
            return;
        }

        try {
            setError("");
            const payload = {
                offeredPrice: parseFloat(responseData.offeredPrice),
                estimatedDeliveryTime: responseData.estimatedDeliveryTime,
                message: responseData.message || null,
            };
            await respondToRFQ(id, payload);
            setSuccess("Quotation submitted successfully");
            setShowResponseModal(false);
            setResponseData({ offeredPrice: "", estimatedDeliveryTime: "", message: "" });
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit quotation");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        return expiry < today;
    };

    const isAdvanced = seller?.sellerMode === "ADVANCED";

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <div style={{ fontSize: "18px" }}>Loading RFQ Details...</div>
            </div>
        );
    }

    if (!rfq) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <div style={{ fontSize: "18px" }}>RFQ not found</div>
            </div>
        );
    }

    const expired = isExpired(rfq.expiryDate);

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: "30px" }}>
                <button
                    onClick={() => navigate("/seller/rfqs")}
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
                    ← Back to RFQ List
                </button>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                            RFQ Details
                            {isAdvanced && (
                                <span style={{
                                    backgroundColor: "#fef3c7",
                                    color: "#92400e",
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    border: "1px solid #fcd34d"
                                }}>
                                    PRIORITY SELLER
                                </span>
                            )}
                        </h2>
                    </div>
                    {!rfq.hasResponded && !expired && (
                        <button
                            onClick={() => setShowResponseModal(true)}
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
                            Submit Quotation
                        </button>
                    )}
                    {rfq.hasResponded && (
                        <span style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                            fontSize: "14px",
                            fontWeight: "600"
                        }}>
                            ✓ Already Responded
                        </span>
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

            {expired && (
                <div style={{
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    border: "1px solid #fcd34d"
                }}>
                    ⚠️ This RFQ has expired and is no longer accepting responses.
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                {/* Main Content */}
                <div>
                    {/* RFQ Details */}
                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        padding: "25px",
                        marginBottom: "20px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>RFQ Information</h3>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Product Requirement</label>
                            <div style={{
                                fontSize: "18px",
                                color: "#1e293b",
                                fontWeight: "600",
                                marginTop: "8px",
                                padding: "15px",
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px"
                            }}>
                                {rfq.productRequirement}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Quantity</label>
                                <div style={{ fontSize: "16px", color: "#2563eb", fontWeight: "700", marginTop: "4px" }}>
                                    {rfq.quantity} units
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Delivery Country</label>
                                <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                                    {rfq.deliveryCountry}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Expiry Date</label>
                                <div style={{
                                    fontSize: "14px",
                                    color: expired ? "#ef4444" : "#475569",
                                    fontWeight: expired ? "600" : "400",
                                    marginTop: "4px"
                                }}>
                                    {formatDate(rfq.expiryDate)}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Responses</label>
                                <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                                    {rfq.responseCount || 0} quotations
                                </div>
                            </div>
                        </div>

                        {rfq.description && (
                            <div style={{ marginTop: "20px" }}>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Description</label>
                                <div style={{
                                    fontSize: "14px",
                                    color: "#475569",
                                    marginTop: "8px",
                                    padding: "15px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                    whiteSpace: "pre-wrap",
                                    lineHeight: "1.6"
                                }}>
                                    {rfq.description}
                                </div>
                            </div>
                        )}
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
                                    {rfq.buyerName}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Country</label>
                                <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>
                                    {rfq.buyerCountry}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Responses (if visible) */}
                    {responses.length > 0 && (
                        <div style={{
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            padding: "25px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                            <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>
                                Other Quotations ({responses.length})
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                {responses.map((response) => (
                                    <div
                                        key={response.id}
                                        style={{
                                            padding: "15px",
                                            backgroundColor: "#f8fafc",
                                            borderRadius: "8px",
                                            border: response.sellerMode === "ADVANCED" ? "2px solid #fcd34d" : "1px solid #e2e8f0"
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                                            <div>
                                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                                                    {response.sellerBusinessName}
                                                </div>
                                                {response.sellerMode === "ADVANCED" && (
                                                    <span style={{
                                                        fontSize: "11px",
                                                        backgroundColor: "#fef3c7",
                                                        color: "#92400e",
                                                        padding: "2px 6px",
                                                        borderRadius: "10px",
                                                        marginLeft: "8px"
                                                    }}>
                                                        PRIORITY
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#2563eb" }}>
                                                ₹{response.offeredPrice?.toLocaleString('en-IN') || "0.00"}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
                                            Delivery: {response.estimatedDeliveryTime}
                                        </div>
                                        {response.message && (
                                            <div style={{
                                                fontSize: "13px",
                                                color: "#475569",
                                                padding: "10px",
                                                backgroundColor: "#fff",
                                                borderRadius: "6px",
                                                marginTop: "8px"
                                            }}>
                                                {response.message}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div>
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
                                <strong>Created:</strong> {formatDate(rfq.createdAt)}
                            </div>
                            {rfq.updatedAt && (
                                <div>
                                    <strong>Last Updated:</strong> {formatDate(rfq.updatedAt)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Response Modal */}
            {showResponseModal && (
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
                        <h3 style={{ marginTop: 0, color: "#1e293b", fontSize: "20px" }}>Submit Quotation</h3>
                        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                            Provide your quotation details for this RFQ
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                                    Offered Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={responseData.offeredPrice}
                                    onChange={(e) => setResponseData({ ...responseData, offeredPrice: e.target.value })}
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
                                    Estimated Delivery Time *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={responseData.estimatedDeliveryTime}
                                    onChange={(e) => setResponseData({ ...responseData, estimatedDeliveryTime: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="e.g., 15-20 days, 4 weeks"
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                                    Message (Optional)
                                </label>
                                <textarea
                                    rows="4"
                                    value={responseData.message}
                                    onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                        fontSize: "14px",
                                        resize: "vertical",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder="Additional details about your quotation..."
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                            <button
                                onClick={() => {
                                    setShowResponseModal(false);
                                    setResponseData({ offeredPrice: "", estimatedDeliveryTime: "", message: "" });
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
                                onClick={handleSubmitResponse}
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
                                Submit Quotation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RFQDetail;




