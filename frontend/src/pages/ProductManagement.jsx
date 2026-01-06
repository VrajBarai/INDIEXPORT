import { useState, useEffect } from "react";
import { getMyProducts, addProduct, updateProduct, deleteProduct, getAllCountries } from "../services/productService";
import { getSellerProfile } from "../services/sellerService";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        minQuantity: "",
        description: "",
        imageUrl: "",
        status: "ACTIVE",
        declaredStock: "",
        sellingCountries: [],
    });
    const [countries, setCountries] = useState([]);
    const [countrySearchTerm, setCountrySearchTerm] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [selectAllCountries, setSelectAllCountries] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const PRODUCT_LIMIT = 5;

    useEffect(() => {
        fetchData();
        fetchCountries();
    }, []);

    // Close country dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCountryDropdown && !event.target.closest('[data-country-dropdown]')) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCountryDropdown]);

    const fetchCountries = async () => {
        try {
            const res = await getAllCountries();
            setCountries(res.data || []);
        } catch (err) {
            console.error("Failed to fetch countries:", err);
        }
    };

    const fetchData = async () => {
        try {
            setError("");
            const [prodRes, sellRes] = await Promise.all([
                getMyProducts(),
                getSellerProfile(),
            ]);
            setProducts(prodRes.data || []);
            setSeller(sellRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load products/profile. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        const isAdvanced = seller?.sellerMode === "ADVANCED";
        if (!isAdvanced && products.length >= PRODUCT_LIMIT) {
            setShowLimitModal(true);
            return;
        }
        setEditingProduct(null);
        setFormData({
            name: "",
            category: "",
            price: "",
            minQuantity: "",
            description: "",
            imageUrl: "",
            status: "ACTIVE",
            declaredStock: "",
            sellingCountries: [],
        });
        setSelectAllCountries(false);
        setCountrySearchTerm("");
        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || "",
            category: product.category || "",
            price: product.price || "",
            minQuantity: product.minQuantity || "",
            description: product.description || "",
            imageUrl: product.imageUrl || "",
            status: product.status || "ACTIVE",
            declaredStock: product.declaredStock || "",
            sellingCountries: product.sellingCountries || [],
        });
        setSelectAllCountries(product.sellingCountries && product.sellingCountries.length === countries.length);
        setCountrySearchTerm("");
        setError("");
        setSuccess("");
        setShowModal(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setError("");
            await deleteProduct(productToDelete.id);
            setSuccess("Product deleted successfully");
            setShowDeleteModal(false);
            setProductToDelete(null);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete product");
            setShowDeleteModal(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError("");
            setSuccess("");

            // Validate required fields
            if (!formData.name || !formData.price || !formData.minQuantity) {
                setError("Please fill in all required fields (Name, Price, Min Quantity)");
                return;
            }

            // Validate selling countries
            const selectedCountries = selectAllCountries
                ? countries.map(c => c.code)
                : (formData.sellingCountries || []);
            if (!selectedCountries || selectedCountries.length === 0) {
                setError("Please select at least one country where this product is available for sale");
                return;
            }

            // Check limit for new products only
            if (!editingProduct) {
                const isAdvanced = seller?.sellerMode === "ADVANCED";
                if (!isAdvanced && products.length >= PRODUCT_LIMIT) {
                    setShowLimitModal(true);
                    setShowModal(false);
                    return;
                }
            }

            const productPayload = {
                name: formData.name,
                category: formData.category || null,
                price: parseFloat(formData.price),
                minQuantity: parseInt(formData.minQuantity),
                description: formData.description || null,
                imageUrl: formData.imageUrl || null,
                status: formData.status || "ACTIVE",
                declaredStock: formData.declaredStock ? parseInt(formData.declaredStock) : 0,
                sellingCountries: selectAllCountries
                    ? countries.map(c => c.code)
                    : (formData.sellingCountries || []),
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, productPayload);
                setSuccess("Product updated successfully");
            } else {
                await addProduct(productPayload);
                setSuccess("Product added successfully");
            }

            setShowModal(false);
            setEditingProduct(null);
            setFormData({
                name: "",
                category: "",
                price: "",
                minQuantity: "",
                description: "",
                imageUrl: "",
                status: "ACTIVE",
            });
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Submit error:", err);
            const errorMessage = err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                "Failed to save product. Please try again.";
            setError(errorMessage);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
            name: "",
            category: "",
            price: "",
            minQuantity: "",
            description: "",
            imageUrl: "",
            status: "ACTIVE",
            declaredStock: "",
            sellingCountries: [],
        });
        setSelectAllCountries(false);
        setCountrySearchTerm("");
        setShowCountryDropdown(false);
        setError("");
        setSuccess("");
    };

    const handleCountryToggle = (countryCode) => {
        const current = formData.sellingCountries || [];
        let updated;
        if (current.includes(countryCode)) {
            updated = current.filter(c => c !== countryCode);
            setFormData({
                ...formData,
                sellingCountries: updated
            });
            setSelectAllCountries(false);
        } else {
            updated = [...current, countryCode];
            setFormData({
                ...formData,
                sellingCountries: updated
            });
            if (updated.length === countries.length) {
                setSelectAllCountries(true);
            }
        }
    };

    const handleSelectAllCountries = () => {
        if (selectAllCountries) {
            setFormData({ ...formData, sellingCountries: [] });
            setSelectAllCountries(false);
        } else {
            setFormData({ ...formData, sellingCountries: countries.map(c => c.code) });
            setSelectAllCountries(true);
        }
    };

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(countrySearchTerm.toLowerCase())
    );

    const isAdvanced = seller?.sellerMode === "ADVANCED";
    const limitReached = !isAdvanced && products.length >= PRODUCT_LIMIT;
    const productsUsed = products.length;
    const productsRemaining = PRODUCT_LIMIT - productsUsed;

    if (loading) {
        return (
            <div style={{
                textAlign: "center",
                padding: "50px",
                color: "#666",
                backgroundColor: "#f8fafc",
                minHeight: "100vh"
            }}>
                <div style={{ fontSize: "18px", marginBottom: "10px" }}>Loading Product Module...</div>
                <div style={{ fontSize: "14px", color: "#94a3b8" }}>Please wait</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            {/* Success Message */}
            {success && (
                <div style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    border: "1px solid #86efac",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <span>{success}</span>
                    <button
                        onClick={() => setSuccess("")}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#166534",
                            cursor: "pointer",
                            fontSize: "18px",
                            fontWeight: "bold"
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    backgroundColor: "#fef2f2",
                    color: "#b91c1c",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    border: "1px solid #fee2e2",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <span>{error}</span>
                    <button
                        onClick={() => setError("")}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#b91c1c",
                            cursor: "pointer",
                            fontSize: "18px",
                            fontWeight: "bold"
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* BASIC Seller Upgrade Banner */}
            {!isAdvanced && (
                <div style={{
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    padding: "15px 20px",
                    borderRadius: "10px",
                    marginBottom: "25px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <h4 style={{ margin: 0, color: "#1e40af" }}>You are on BASIC Seller Plan</h4>
                        <p style={{ margin: "5px 0 0", color: "#60a5fa", fontSize: "14px" }}>
                            Upgrade to Advanced Seller to list unlimited products and get priority tags.
                        </p>
                    </div>
                    <button
                        style={{
                            backgroundColor: "#1d4ed8",
                            color: "#fff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#1e40af"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#1d4ed8"}
                    >
                        Upgrade Now
                    </button>
                </div>
            )}

            {/* Header Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <h2 style={{ color: "#1e293b", margin: 0 }}>Product Management</h2>
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
                                ADVANCED SELLER
                            </span>
                        )}
                    </div>
                    <p style={{ color: "#64748b", margin: "5px 0 0" }}>Manage your B2B offerings and inventory</p>
                </div>

                <div style={{ textAlign: "right" }}>
                    {/* Product Usage Indicator for BASIC sellers */}
                    {!isAdvanced && (
                        <div style={{ marginBottom: "15px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                                <span style={{ color: "#64748b" }}>
                                    Usage: <b>{productsUsed}/{PRODUCT_LIMIT}</b> products
                                </span>
                                <span style={{ color: limitReached ? "#ef4444" : "#10b981" }}>
                                    {limitReached ? "Limit Reached" : `${productsRemaining} remaining`}
                                </span>
                            </div>
                            <div style={{ width: "200px", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{
                                    width: `${Math.min((productsUsed / PRODUCT_LIMIT) * 100, 100)}%`,
                                    height: "100%",
                                    backgroundColor: limitReached ? "#ef4444" : "#3b82f6",
                                    transition: "width 0.3s ease"
                                }} />
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleOpenModal}
                        disabled={limitReached}
                        style={{
                            padding: "12px 24px",
                            backgroundColor: limitReached ? "#cbd5e1" : "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: limitReached ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            boxShadow: limitReached ? "none" : "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
                            transition: "all 0.2s"
                        }}
                        title={limitReached ? "Product limit reached. Upgrade to Advanced Seller." : "Add new product"}
                        onMouseOver={(e) => {
                            if (!limitReached) {
                                e.target.style.backgroundColor = "#1d4ed8";
                                e.target.style.transform = "translateY(-1px)";
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!limitReached) {
                                e.target.style.backgroundColor = "#2563eb";
                                e.target.style.transform = "translateY(0)";
                            }
                        }}
                    >
                        + Add New Product
                    </button>
                </div>
            </div>

            {/* Product Table */}
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
                            <th style={thStyle}>Product Name</th>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>Price</th>
                            <th style={thStyle}>Min Qty (MOQ)</th>
                            <th style={thStyle}>Stock</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>📦</div>
                                    <p style={{ margin: 0 }}>No products listed yet. Start by adding your first product.</p>
                                </td>
                            </tr>
                        ) : (
                            products.map((p) => (
                                <tr
                                    key={p.id}
                                    style={{
                                        borderBottom: "1px solid #f1f5f9",
                                        transition: "background 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: "600", color: "#1e293b" }}>
                                            {p.name}
                                            {isAdvanced && (
                                                <span style={{ marginLeft: "8px", color: "#fbbf24" }} title="Priority Listing">★</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>ID: {p.id}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            backgroundColor: "#f1f5f9",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "13px"
                                        }}>
                                            {p.category || "N/A"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: "700", color: "#2563eb" }}>
                                            ₹{p.price?.toLocaleString('en-IN') || "0.00"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{p.minQuantity || 0} units</td>
                                    <td style={tdStyle}>
                                        <div style={{ marginBottom: "4px" }}>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                Declared: <strong>{p.declaredStock || 0}</strong>
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                Reserved: <strong>{p.reservedStock || 0}</strong>
                                            </div>
                                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", marginTop: "4px" }}>
                                                Available: <strong style={{ color: p.remainingStock > 10 ? "#10b981" : p.remainingStock > 0 ? "#f59e0b" : "#ef4444" }}>
                                                    {p.remainingStock || 0}
                                                </strong>
                                            </div>
                                        </div>
                                        <span style={{
                                            backgroundColor: p.stockStatus === "IN_STOCK" ? "#dcfce7" : p.stockStatus === "LOW_STOCK" ? "#fef3c7" : "#fee2e2",
                                            color: p.stockStatus === "IN_STOCK" ? "#166534" : p.stockStatus === "LOW_STOCK" ? "#92400e" : "#991b1b",
                                            padding: "3px 8px",
                                            borderRadius: "12px",
                                            fontSize: "11px",
                                            fontWeight: "600"
                                        }}>
                                            {p.stockStatus === "IN_STOCK" ? "In Stock" : p.stockStatus === "LOW_STOCK" ? "Low Stock" : "Out of Stock"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            backgroundColor: p.status === "ACTIVE" ? "#dcfce7" : "#fef3c7",
                                            color: p.status === "ACTIVE" ? "#166534" : "#92400e",
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "600"
                                        }}>
                                            {p.status || "ACTIVE"}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => handleEdit(p)}
                                            style={{
                                                color: "#2563eb",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                marginRight: "15px",
                                                fontWeight: "500",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                transition: "background 0.2s"
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = "#eff6ff"}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(p)}
                                            style={{
                                                color: "#ef4444",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: "500",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                transition: "background 0.2s"
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = "#fef2f2"}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Product Modal */}
            {showModal && (
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
                        padding: "40px",
                        borderRadius: "16px",
                        width: "550px",
                        maxWidth: "95%",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}>
                        <h3 style={{ marginTop: 0, color: "#1e293b", fontSize: "24px" }}>
                            {editingProduct ? "Edit Product" : "Add New Product"}
                        </h3>
                        <p style={{ color: "#64748b", marginTop: "-15px", marginBottom: "25px", fontSize: "14px" }}>
                            {editingProduct ? "Update your product details" : "List your product on IndiExport B2B Marketplace"}
                        </p>

                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2",
                                color: "#b91c1c",
                                padding: "10px",
                                borderRadius: "6px",
                                marginBottom: "20px",
                                fontSize: "14px"
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={labelStyle}>Product Name *</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. Cotton Fabrics"
                                />
                            </div>
                            <div style={{ display: "flex", gap: "20px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Category</label>
                                    <input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={inputStyle}
                                        placeholder="e.g. Textiles"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="DRAFT">Draft</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "20px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Price (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        style={inputStyle}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Min Order Quantity *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.minQuantity}
                                        onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                                        style={inputStyle}
                                        placeholder="MOQ"
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Declared Stock (Available Quantity) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.declaredStock}
                                    onChange={(e) => setFormData({ ...formData, declaredStock: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Enter total available stock"
                                />
                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                    This is the total quantity you have available for sale. Stock will be reserved when buyers create inquiries.
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Selling Countries *</label>
                                <div style={{ position: "relative" }} data-country-dropdown>
                                    <div
                                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                        style={{
                                            ...inputStyle,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            minHeight: "42px"
                                        }}
                                    >
                                        <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                            {selectAllCountries ? (
                                                <span style={{
                                                    backgroundColor: "#dbeafe",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "12px"
                                                }}>All Countries</span>
                                            ) : formData.sellingCountries && formData.sellingCountries.length > 0 ? (
                                                formData.sellingCountries.slice(0, 3).map(code => {
                                                    const country = countries.find(c => c.code === code);
                                                    return (
                                                        <span key={code} style={{
                                                            backgroundColor: "#dbeafe",
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "12px"
                                                        }}>
                                                            {country ? country.name : code}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span style={{ color: "#94a3b8" }}>Select countries for sale...</span>
                                            )}
                                            {!selectAllCountries && formData.sellingCountries && formData.sellingCountries.length > 3 && (
                                                <span style={{ color: "#64748b", fontSize: "12px" }}>
                                                    +{formData.sellingCountries.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ color: "#64748b" }}>▼</span>
                                    </div>
                                    {showCountryDropdown && (
                                        <div style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            backgroundColor: "#fff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            marginTop: "4px",
                                            maxHeight: "300px",
                                            overflowY: "auto",
                                            zIndex: 1000,
                                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                                        }}>
                                            <div style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search countries..."
                                                    value={countrySearchTerm}
                                                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        width: "100%",
                                                        padding: "8px",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "4px",
                                                        fontSize: "14px"
                                                    }}
                                                />
                                            </div>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectAllCountries();
                                                }}
                                                style={{
                                                    padding: "10px 12px",
                                                    cursor: "pointer",
                                                    backgroundColor: selectAllCountries ? "#fee2e2" : "#eff6ff",
                                                    borderBottom: "1px solid #f1f5f9",
                                                    fontWeight: "600",
                                                    fontSize: "14px",
                                                    color: selectAllCountries ? "#b91c1c" : "#1e40af",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between"
                                                }}
                                            >
                                                <span>{selectAllCountries ? "Deselect All Countries" : "Select All Countries"}</span>
                                                <span style={{ fontSize: "16px" }}>{selectAllCountries ? "✕" : "✓"}</span>
                                            </div>
                                            {filteredCountries.map(country => {
                                                const isSelected = (formData.sellingCountries || []).includes(country.code);
                                                return (
                                                    <div
                                                        key={country.code}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCountryToggle(country.code);
                                                        }}
                                                        style={{
                                                            padding: "10px 12px",
                                                            cursor: "pointer",
                                                            backgroundColor: isSelected ? "#eff6ff" : "transparent",
                                                            borderBottom: "1px solid #f1f5f9",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isSelected) e.target.style.backgroundColor = "#f8fafc";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isSelected) e.target.style.backgroundColor = "transparent";
                                                        }}
                                                    >
                                                        <span style={{ fontSize: "16px" }}>
                                                            {isSelected ? "✓" : ""}
                                                        </span>
                                                        <span style={{ flex: 1 }}>{country.name}</span>
                                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{country.code}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                    Select the countries where this product is available for sale. Buyers from selected countries will see this product.
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, resize: "none" }}
                                    placeholder="Brief details about the product..."
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Image URL (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    style={inputStyle}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                        backgroundColor: "#fff",
                                        cursor: "pointer",
                                        color: "#64748b",
                                        fontWeight: "600"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 2,
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "none",
                                        backgroundColor: "#2563eb",
                                        color: "#fff",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.4)"
                                    }}
                                >
                                    {editingProduct ? "Update Product" : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Limit Reached Modal */}
            {showLimitModal && (
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
                    zIndex: 1001
                }}>
                    <div style={{
                        backgroundColor: "#fff",
                        padding: "40px",
                        borderRadius: "16px",
                        width: "450px",
                        maxWidth: "95%",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
                        <h3 style={{ margin: "0 0 15px", color: "#1e293b", fontSize: "22px" }}>
                            Product Limit Reached
                        </h3>
                        <p style={{ color: "#64748b", marginBottom: "25px", lineHeight: "1.6" }}>
                            You have reached the maximum limit of <strong>{PRODUCT_LIMIT} products</strong> for BASIC sellers.
                            <br /><br />
                            Upgrade to <strong>ADVANCED Seller</strong> to list unlimited products and get priority visibility.
                        </p>
                        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                            <button
                                onClick={() => setShowLimitModal(false)}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    color: "#64748b",
                                    fontWeight: "600"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowLimitModal(false);
                                    // TODO: Navigate to upgrade page
                                }}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: "#2563eb",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && productToDelete && (
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
                    zIndex: 1001
                }}>
                    <div style={{
                        backgroundColor: "#fff",
                        padding: "40px",
                        borderRadius: "16px",
                        width: "450px",
                        maxWidth: "95%",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🗑️</div>
                        <h3 style={{ margin: "0 0 15px", color: "#1e293b", fontSize: "22px" }}>
                            Delete Product?
                        </h3>
                        <p style={{ color: "#64748b", marginBottom: "25px", lineHeight: "1.6" }}>
                            Are you sure you want to delete <strong>"{productToDelete.name}"</strong>?
                            <br />
                            This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setProductToDelete(null);
                                }}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    color: "#64748b",
                                    fontWeight: "600"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: "#ef4444",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569"
};

const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box"
};

export default ProductManagement;
