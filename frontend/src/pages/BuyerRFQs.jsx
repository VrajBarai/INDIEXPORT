import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableRFQs, createRFQ, updateRFQ, deleteRFQ, getRFQResponses } from "../services/rfqService";
import { getAllCountries } from "../services/productService";

const BuyerRFQs = () => {
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResponsesModal, setShowResponsesModal] = useState(false);
    const [selectedRFQ, setSelectedRFQ] = useState(null);
    const [responses, setResponses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [countries, setCountries] = useState([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        productRequirement: "",
        quantity: "",
        description: "",
        deliveryCountry: "",
        expiryDate: ""
    });

    useEffect(() => {
        fetchRFQs();
        fetchCountries();
    }, []);

    const fetchRFQs = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getAvailableRFQs();
            setRfqs(response.data);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load RFQs");
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await getAllCountries();
            setCountries(response.data);
        } catch (err) {
            console.error("Failed to load countries:", err);
        }
    };

    const handleCreate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData({
            productRequirement: "",
            quantity: "",
            description: "",
            deliveryCountry: "",
            expiryDate: tomorrow.toISOString().split('T')[0]
        });
        setShowCreateModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError("");
            if (editingId) {
                await updateRFQ(editingId, formData);
                setEditingId(null);
            } else {
                await createRFQ(formData);
            }
            setShowCreateModal(false);
            fetchRFQs();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save RFQ");
        }
    };

    const handleEdit = (rfq) => {
        setEditingId(rfq.id);
        setFormData({
            productRequirement: rfq.productRequirement,
            quantity: rfq.quantity.toString(),
            description: rfq.description || "",
            deliveryCountry: rfq.deliveryCountry,
            expiryDate: rfq.expiryDate
        });
        setShowCreateModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this RFQ?")) return;

        try {
            await deleteRFQ(id);
            fetchRFQs();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete RFQ");
        }
    };

    const handleViewResponses = async (rfq) => {
        try {
            setSelectedRFQ(rfq);
            const response = await getRFQResponses(rfq.id);
            setResponses(response.data);
            setShowResponsesModal(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load responses");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
                <div>Loading RFQs...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ margin: 0, color: "#1e293b" }}>My RFQs</h2>
                    <button
                        onClick={handleCreate}
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
                        Create RFQ
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

                {rfqs.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
                        <p style={{ fontSize: "18px", color: "#64748b" }}>No RFQs posted yet</p>
                        <button
                            onClick={handleCreate}
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
                            Create RFQ
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {rfqs.map((rfq) => {
                            const isExpired = new Date(rfq.expiryDate) < new Date();
                            const canEdit = rfq.status === "OPEN" && rfq.responseCount === 0;

                            return (
                                <div
                                    key={rfq.id}
                                    style={{
                                        backgroundColor: "#fff",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: "0 0 5px", color: "#1e293b" }}>{rfq.productRequirement}</h3>
                                            <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
                                                Quantity: {rfq.quantity} • Delivery: {rfq.deliveryCountry}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                                            <span style={{
                                                backgroundColor: rfq.status === "OPEN" ? "#dbeafe" : "#f3f4f6",
                                                color: rfq.status === "OPEN" ? "#1e40af" : "#6b7280",
                                                padding: "6px 12px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "600"
                                            }}>
                                                {rfq.status}
                                            </span>
                                            {rfq.responseCount > 0 && (
                                                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>
                                                    {rfq.responseCount} response{rfq.responseCount !== 1 ? "s" : ""}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {rfq.description && (
                                        <p style={{ margin: "10px 0", fontSize: "14px", color: "#64748b" }}>
                                            {rfq.description}
                                        </p>
                                    )}

                                    <div style={{ marginTop: "15px", fontSize: "12px", color: "#94a3b8" }}>
                                        Expiry: {formatDate(rfq.expiryDate)}
                                        {isExpired && <span style={{ color: "#ef4444", marginLeft: "10px" }}>• Expired</span>}
                                    </div>

                                    <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                                        {rfq.responseCount > 0 && (
                                            <button
                                                onClick={() => handleViewResponses(rfq)}
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
                                                View Responses ({rfq.responseCount})
                                            </button>
                                        )}
                                        {canEdit && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(rfq)}
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#1976d2",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rfq.id)}
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: "#ef4444",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Create/Edit Modal */}
                {showCreateModal && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: "#fff",
                            padding: "30px",
                            borderRadius: "12px",
                            maxWidth: "600px",
                            width: "90%",
                            maxHeight: "90vh",
                            overflow: "auto"
                        }}>
                            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
                                {editingId ? "Edit RFQ" : "Create RFQ"}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Product Requirement *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.productRequirement}
                                        onChange={(e) => setFormData({ ...formData, productRequirement: e.target.value })}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        required
                                        min="1"
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="4"
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Delivery Country *
                                    </label>
                                    <select
                                        value={formData.deliveryCountry}
                                        onChange={(e) => setFormData({ ...formData, deliveryCountry: e.target.value })}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px"
                                        }}
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Expiry Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            backgroundColor: "#1976d2",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "600"
                                        }}
                                    >
                                        {editingId ? "Update" : "Create"} RFQ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setEditingId(null);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: "12px",
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
                            </form>
                        </div>
                    </div>
                )}

                {/* Responses Modal */}
                {showResponsesModal && selectedRFQ && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: "#fff",
                            padding: "30px",
                            borderRadius: "12px",
                            maxWidth: "700px",
                            width: "90%",
                            maxHeight: "90vh",
                            overflow: "auto"
                        }}>
                            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
                                Responses for: {selectedRFQ.productRequirement}
                            </h2>
                            {responses.length === 0 ? (
                                <p style={{ color: "#64748b" }}>No responses yet</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                    {responses.map((response) => (
                                        <div
                                            key={response.id}
                                            style={{
                                                padding: "15px",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                                <div>
                                                    <strong>{response.sellerBusinessName}</strong>
                                                    {response.sellerMode === "ADVANCED" && (
                                                        <span style={{
                                                            marginLeft: "10px",
                                                            padding: "2px 8px",
                                                            backgroundColor: "#fbbf24",
                                                            color: "#92400e",
                                                            borderRadius: "4px",
                                                            fontSize: "11px",
                                                            fontWeight: "600"
                                                        }}>
                                                            ADVANCED
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: "18px", fontWeight: "700", color: "#1976d2" }}>
                                                    ₹{response.offeredPrice?.toFixed(2)}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "10px" }}>
                                                <div>Delivery Time: {response.estimatedDeliveryTime}</div>
                                            </div>
                                            {response.message && (
                                                <p style={{ fontSize: "14px", color: "#1e293b", margin: "10px 0" }}>
                                                    {response.message}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    setShowResponsesModal(false);
                                    setSelectedRFQ(null);
                                }}
                                style={{
                                    marginTop: "20px",
                                    padding: "12px 24px",
                                    backgroundColor: "#6b7280",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerRFQs;

