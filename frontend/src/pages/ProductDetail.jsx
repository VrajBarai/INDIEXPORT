import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductDetails } from "../services/productService";
import { createInquiry } from "../services/inquiryService";
import { createDirectOrder } from "../services/orderService";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const [inquiryData, setInquiryData] = useState({
        requestedQuantity: "",
        message: "",
        shippingOption: "Courier"
    });

    const [orderData, setOrderData] = useState({
        finalQuantity: "",
        shippingTerms: "FOB"
    });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getProductDetails(id);
            setProduct(response.data);
            setInquiryData(prev => ({
                ...prev,
                requestedQuantity: response.data.minQuantity || ""
            }));
            setOrderData(prev => ({
                ...prev,
                finalQuantity: response.data.minQuantity || ""
            }));
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        try {
            setError("");
            if (!inquiryData.requestedQuantity || parseInt(inquiryData.requestedQuantity) < product.minQuantity) {
                setError(`Minimum quantity required: ${product.minQuantity}`);
                return;
            }

            await createInquiry({
                productId: product.id,
                message: inquiryData.message,
                shippingOption: inquiryData.shippingOption
            });

            setShowInquiryModal(false);
            navigate("/buyer/inquiries");
        } catch (err) {
            console.error("Inquiry error:", err);
            setError(err.response?.data?.message || "Failed to send inquiry");
        }
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        try {
            setError("");
            if (!orderData.finalQuantity || parseInt(orderData.finalQuantity) < product.minQuantity) {
                setError(`Minimum quantity required: ${product.minQuantity}`);
                return;
            }

            const shippingCost = 500; // Fixed placeholders as per rule to show shipping
            await createDirectOrder({
                productId: product.id,
                finalQuantity: parseInt(orderData.finalQuantity),
                finalPrice: product.price,
                currency: "INR",
                shippingTerms: orderData.shippingTerms,
                shippingCost: shippingCost
            });

            setShowOrderModal(false);
            navigate("/buyer/orders");
        } catch (err) {
            console.error("Order error:", err);
            setError(err.response?.data?.message || "Failed to place order");
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
                <div>Loading product details...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
                <div>Product not found</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        marginBottom: "20px",
                        padding: "8px 16px",
                        backgroundColor: "#6b7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    ← Back
                </button>

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
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "30px",
                    backgroundColor: "#fff",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    {/* Product Image */}
                    <div>
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                    width: "100%",
                                    height: "400px",
                                    objectFit: "cover",
                                    borderRadius: "8px"
                                }}
                            />
                        ) : (
                            <div style={{
                                width: "100%",
                                height: "400px",
                                backgroundColor: "#f1f5f9",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "48px"
                            }}>
                                📦
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div>
                        <h1 style={{ margin: "0 0 10px", color: "#1e293b" }}>{product.name}</h1>
                        <p style={{ color: "#64748b", marginBottom: "20px" }}>{product.category}</p>

                        <div style={{ marginBottom: "20px" }}>
                            <div style={{
                                fontSize: "36px",
                                fontWeight: "700",
                                color: "#1976d2",
                                marginBottom: "5px"
                            }}>
                                {product.currencySymbol || "$"}{product.convertedPrice?.toFixed(2) || product.price?.toFixed(2)}
                            </div>
                            {product.convertedPrice && (
                                <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                                    Original Price: ₹{product.price?.toFixed(2)} INR
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "#1e293b" }}>Product Information</h3>
                            <div style={{ display: "grid", gap: "10px" }}>
                                <div>
                                    <strong>Seller:</strong> {product.sellerBusinessName}
                                </div>
                                <div>
                                    <strong>Available Stock:</strong>{" "}
                                    <span style={{
                                        color: product.remainingStock > 0 ? "#166534" : "#b91c1c",
                                        fontWeight: "600"
                                    }}>
                                        {product.remainingStock > 0 ? `${product.remainingStock} units` : "Out of Stock"}
                                    </span>
                                </div>
                                <div>
                                    <strong>Minimum Quantity:</strong> {product.minQuantity} units
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "#1e293b" }}>Description</h3>
                            <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                                {product.description || "No description available"}
                            </p>
                        </div>

                        {product.remainingStock > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <button
                                    onClick={() => setShowInquiryModal(true)}
                                    style={{
                                        padding: "14px",
                                        backgroundColor: "#f1f5f9",
                                        color: "#475569",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        fontWeight: "600"
                                    }}
                                >
                                    Send Inquiry
                                </button>
                                <button
                                    onClick={() => setShowOrderModal(true)}
                                    style={{
                                        padding: "14px",
                                        backgroundColor: "#10b981",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        fontWeight: "600"
                                    }}
                                >
                                    Place Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inquiry Modal */}
                {showInquiryModal && (
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
                            maxWidth: "500px",
                            width: "90%",
                            maxHeight: "90vh",
                            overflow: "auto"
                        }}>
                            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Send Inquiry</h2>
                            <form onSubmit={handleInquirySubmit}>
                                {/* Quantity Removed from Inquiry */}

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Shipping Option
                                    </label>
                                    <select
                                        value={inquiryData.shippingOption}
                                        onChange={(e) => setInquiryData({
                                            ...inquiryData,
                                            shippingOption: e.target.value
                                        })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px"
                                        }}
                                    >
                                        <option value="Courier">Courier</option>
                                        <option value="Air Freight">Air Freight</option>
                                        <option value="Sea Freight">Sea Freight</option>
                                        <option value="Pickup">Pickup</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Message
                                    </label>
                                    <textarea
                                        value={inquiryData.message}
                                        onChange={(e) => setInquiryData({
                                            ...inquiryData,
                                            message: e.target.value
                                        })}
                                        rows="4"
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
                                        Send Inquiry
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowInquiryModal(false)}
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

                {/* Order Modal */}
                {showOrderModal && (
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
                            maxWidth: "500px",
                            width: "90%",
                            maxHeight: "90vh",
                            overflow: "auto"
                        }}>
                            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Place Direct Order</h2>
                            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                                Direct orders are for immediate business commitment.
                            </p>
                            <form onSubmit={handleOrderSubmit}>
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={orderData.finalQuantity}
                                        onChange={(e) => setOrderData({
                                            ...orderData,
                                            finalQuantity: e.target.value
                                        })}
                                        min={product.minQuantity}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px"
                                        }}
                                    />
                                    <small style={{ color: "#64748b" }}>
                                        Minimum: {product.minQuantity} units
                                    </small>
                                </div>

                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                        Shipping Terms
                                    </label>
                                    <select
                                        value={orderData.shippingTerms}
                                        onChange={(e) => setOrderData({
                                            ...orderData,
                                            shippingTerms: e.target.value
                                        })}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "6px"
                                        }}
                                    >
                                        <option value="FOB">FOB - Free On Board</option>
                                        <option value="CIF">CIF - Cost, Insurance, and Freight</option>
                                        <option value="EXW">EXW - Ex Works</option>
                                        <option value="DDP">DDP - Delivered Duty Paid</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                        <span>Product Amount:</span>
                                        <strong>₹{product.price?.toFixed(2)} x {orderData.finalQuantity || 0}</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", color: "#166534" }}>
                                        <span>Shipping Charge:</span>
                                        <strong>₹500.00</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "18px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                                        <span>FINAL TOTAL AMOUNT:</span>
                                        <span>₹{((product.price * (orderData.finalQuantity || 0)) + 500).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: "12px",
                                            backgroundColor: "#10b981",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Confirm & Place Order
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowOrderModal(false)}
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
            </div>
        </div>
    );
};

export default ProductDetail;
