import { useState, useEffect } from "react";
import { getMyProducts, addProduct, updateProduct, toggleProductStatus, getAllCountries } from "../services/productService";
import { getSellerProfile } from "../services/sellerService";
import SellerSidebar from "../components/SellerSidebar";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
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
        const activeCount = products.filter(p => p.active).length;
        if (activeCount >= PRODUCT_LIMIT) {
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

    const handleStatusToggle = async (product) => {
        try {
            setError("");
            const newStatus = !product.active;
            await toggleProductStatus(product.id, newStatus);
            setSuccess(`Product ${newStatus ? "activated" : "deactivated"} successfully`);
            fetchData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status");
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
                const activeCount = products.filter(p => p.active).length;
                if (!isAdvanced && activeCount >= PRODUCT_LIMIT) {
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

    const handleDeleteConfirm = async () => {
        // Placeholder if we ever re-enable delete, but for now it's removed from UI
        setShowDeleteModal(false);
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
    const activeProducts = products.filter(p => p.active);
    const productsUsed = activeProducts.length;
    const limitReached = productsUsed >= PRODUCT_LIMIT;
    const productsRemaining = PRODUCT_LIMIT - productsUsed;

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
                <div className="page-container" style={{ padding: 0 }}>
                    {/* Success Message */}
                    {success && (
                        <div className="card" style={{
                            backgroundColor: "var(--success-bg)",
                            color: "var(--success-text)",
                            borderColor: "var(--success)",
                            padding: "1rem",
                            marginBottom: "1.5rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span style={{ fontWeight: 500 }}>{success}</span>
                            <button
                                onClick={() => setSuccess("")}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "currentColor", fontSize: "1.25rem" }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="card" style={{
                            backgroundColor: "var(--error-bg)",
                            color: "var(--error-text)",
                            borderColor: "var(--error)",
                            padding: "1rem",
                            marginBottom: "1.5rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span style={{ fontWeight: 500 }}>{error}</span>
                            <button
                                onClick={() => setError("")}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "currentColor", fontSize: "1.25rem" }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* BASIC Seller Upgrade Banner */}
                    {!isAdvanced && (
                        <div className="card" style={{
                            background: "linear-gradient(to right, #eff6ff, #ffffff)",
                            borderColor: "#bfdbfe",
                            marginBottom: "2rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div>
                                <h4 style={{ color: "#1e40af", marginBottom: "0.25rem" }}>You are on the BASIC Seller Plan</h4>
                                <p style={{ margin: 0, color: "#3b82f6", fontSize: "0.9rem" }}>
                                    Upgrade to <strong>Advanced Seller</strong> to list unlimited products and get priority visibility.
                                </p>
                            </div>
                            <button className="btn btn-primary" style={{ backgroundColor: "#1d4ed8" }}>
                                Upgrade Now
                            </button>
                        </div>
                    )}

                    {/* Header Section */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <h2 style={{ margin: 0, fontSize: "1.875rem" }}>Product Management</h2>
                                {isAdvanced && (
                                    <span className="badge badge-warning" style={{ border: "1px solid #fcd34d" }}>
                                        ADVANCED SELLER
                                    </span>
                                )}
                            </div>
                            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Manage your B2B offerings and inventory</p>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            {/* Product Usage Indicator */}
                            <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1rem", display: "inline-block", minWidth: "260px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                                    <span style={{ color: "var(--text-secondary)" }}>
                                        Active products: <span style={{ color: "var(--text-main)" }}>{productsUsed} / {PRODUCT_LIMIT}</span>
                                    </span>
                                    <span style={{ color: limitReached ? "var(--error)" : "var(--success)" }}>
                                        {limitReached ? "Limit Reached" : `${productsRemaining} remaining`}
                                    </span>
                                </div>
                                <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-body)", borderRadius: "999px", overflow: "hidden" }}>
                                    <div style={{
                                        width: `${Math.min((productsUsed / PRODUCT_LIMIT) * 100, 100)}%`,
                                        height: "100%",
                                        backgroundColor: limitReached ? "var(--error)" : "var(--primary)",
                                        transition: "width 0.5s ease-out"
                                    }} />
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={handleOpenModal}
                                    disabled={limitReached}
                                    className="btn btn-primary"
                                    title={limitReached ? "Active product limit reached." : "Add new product"}
                                    style={{ width: "100%" }}
                                >
                                    + Add New Product
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Table */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Min Qty (MOQ)</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                                                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📦</div>
                                                <p style={{ margin: 0 }}>No products listed yet. Start by adding your first product.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((p) => (
                                            <tr key={p.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                                        {p.name}
                                                        {isAdvanced && (
                                                            <span style={{ marginLeft: "0.5rem", color: "var(--warning)" }} title="Priority Listing">★</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>ID: {p.id}</div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-inactive" style={{ backgroundColor: "var(--bg-body)" }}>
                                                        {p.category || "N/A"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                                                        ₹{p.price?.toLocaleString('en-IN') || "0.00"}
                                                    </span>
                                                </td>
                                                <td>{p.minQuantity || 0} units</td>
                                                <td>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                                            Declared: <strong>{p.declaredStock || 0}</strong>
                                                        </div>
                                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                                            Reserved: <strong>{p.reservedStock || 0}</strong>
                                                        </div>
                                                        <div style={{ fontSize: "0.80rem", fontWeight: 600, color: "var(--text-main)", marginTop: "2px" }}>
                                                            Available: <span style={{ color: p.remainingStock > 10 ? "var(--success)" : p.remainingStock > 0 ? "var(--warning)" : "var(--error)" }}>
                                                                {p.remainingStock || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ marginTop: "0.25rem" }}>
                                                        <span className={`badge ${p.stockStatus === "IN_STOCK" ? "badge-active" :
                                                            p.stockStatus === "LOW_STOCK" ? "badge-warning" : "badge-error"
                                                            }`}>
                                                            {p.stockStatus === "IN_STOCK" ? "In Stock" : p.stockStatus === "LOW_STOCK" ? "Low Stock" : "Out of Stock"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${!p.active ? (p.remainingStock === 0 ? "badge-error" : "badge-inactive") : "badge-active"
                                                        }`}>
                                                        {p.remainingStock === 0 ? "Out of Stock - Auto Inactive" : (p.active ? "ACTIVE" : "INACTIVE")}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                                        <button
                                                            onClick={() => handleEdit(p)}
                                                            className="btn btn-secondary"
                                                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusToggle(p)}
                                                            disabled={p.remainingStock === 0}
                                                            className={`btn ${p.active ? 'btn-secondary' : 'btn-primary'}`}
                                                            style={{
                                                                padding: "0.4rem 0.8rem",
                                                                fontSize: "0.75rem",
                                                                borderColor: p.active ? "var(--border)" : "transparent"
                                                            }}
                                                            title={p.remainingStock === 0 ? "Cannot activate with 0 stock" : ""}
                                                        >
                                                            {p.active ? "Deactivate" : "Activate"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add/Edit Product Modal */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.5rem" }}>
                                            {editingProduct ? "Edit Product" : "Add New Product"}
                                        </h3>
                                        <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
                                            {editingProduct ? "Update your product details" : "List your product on IndiExport B2B Marketplace"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCloseModal}
                                        style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)" }}
                                    >
                                        ×
                                    </button>
                                </div>

                                {error && (
                                    <div className="badge badge-error" style={{ width: "100%", padding: "0.75rem", marginBottom: "1.5rem", display: "block", textAlign: "center" }}>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                    <div>
                                        <label className="input-label">Product Name *</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g. Cotton Fabrics"
                                        />
                                    </div>
                                    <div className="grid-2">
                                        <div>
                                            <label className="input-label">Category</label>
                                            <input
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="input-field"
                                                placeholder="e.g. Textiles"
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="input-field"
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="DRAFT">Draft</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid-2">
                                        <div>
                                            <label className="input-label">Price (₹) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="input-field"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Min Order Quantity *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={formData.minQuantity}
                                                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                                                className="input-field"
                                                placeholder="MOQ"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Declared Stock (Available Quantity) *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={formData.declaredStock}
                                            onChange={(e) => setFormData({ ...formData, declaredStock: e.target.value })}
                                            className="input-field"
                                            placeholder="Enter total available stock"
                                        />
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                            This is the total quantity you have available for sale. Stock will be reserved when buyers create inquiries.
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Selling Countries *</label>
                                        <div style={{ position: "relative" }} data-country-dropdown>
                                            <div
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                className="input-field"
                                                style={{
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    minHeight: "42px"
                                                }}
                                            >
                                                <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                                    {selectAllCountries ? (
                                                        <span className="badge badge-info">All Countries</span>
                                                    ) : formData.sellingCountries && formData.sellingCountries.length > 0 ? (
                                                        formData.sellingCountries.slice(0, 3).map(code => {
                                                            const country = countries.find(c => c.code === code);
                                                            return (
                                                                <span key={code} className="badge badge-info">
                                                                    {country ? country.name : code}
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span style={{ color: "var(--text-muted)" }}>Select countries for sale...</span>
                                                    )}
                                                    {!selectAllCountries && formData.sellingCountries && formData.sellingCountries.length > 3 && (
                                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                                                            +{formData.sellingCountries.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                                <span style={{ color: "var(--text-secondary)" }}>▼</span>
                                            </div>
                                            {showCountryDropdown && (
                                                <div style={{
                                                    position: "absolute",
                                                    top: "100%",
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: "var(--bg-card)",
                                                    border: "1px solid var(--border)",
                                                    borderRadius: "var(--radius-md)",
                                                    marginTop: "4px",
                                                    maxHeight: "300px",
                                                    overflowY: "auto",
                                                    zIndex: 100,
                                                    boxShadow: "var(--shadow-lg)"
                                                }}>
                                                    <div style={{ padding: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search countries..."
                                                            value={countrySearchTerm}
                                                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="input-field"
                                                            style={{ padding: "0.5rem" }}
                                                        />
                                                    </div>
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectAllCountries();
                                                        }}
                                                        style={{
                                                            padding: "0.625rem 0.75rem",
                                                            cursor: "pointer",
                                                            backgroundColor: selectAllCountries ? "var(--error-bg)" : "var(--primary-light)",
                                                            borderBottom: "1px solid var(--border)",
                                                            fontWeight: 600,
                                                            fontSize: "0.875rem",
                                                            color: selectAllCountries ? "var(--error-text)" : "var(--primary)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between"
                                                        }}
                                                    >
                                                        <span>{selectAllCountries ? "Deselect All Countries" : "Select All Countries"}</span>
                                                        <span style={{ fontSize: "1rem" }}>{selectAllCountries ? "✕" : "✓"}</span>
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
                                                                    padding: "0.625rem 0.75rem",
                                                                    cursor: "pointer",
                                                                    backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                                                                    borderBottom: "1px solid var(--bg-body)",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "0.5rem",
                                                                    color: "var(--text-main)",
                                                                    fontSize: "0.875rem"
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-body)";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                                                                }}
                                                            >
                                                                <span style={{ width: "1.25rem", textAlign: "center", color: "var(--primary)" }}>
                                                                    {isSelected ? "✓" : ""}
                                                                </span>
                                                                <span style={{ flex: 1 }}>{country.name}</span>
                                                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{country.code}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                            Select selling countries. Buyers from selected countries will see this.
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Description</label>
                                        <textarea
                                            rows="4"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-field"
                                            style={{ resize: "vertical" }}
                                            placeholder="Brief details about the product..."
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Image URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            className="input-field"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="btn btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ flex: 2 }}
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
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: "28rem", textAlign: "center" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                                <h3 style={{ margin: "0 0 1rem", fontSize: "1.5rem" }}>
                                    Product Limit Reached
                                </h3>
                                <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                                    You have reached the maximum limit of <strong>{PRODUCT_LIMIT} products</strong> for BASIC sellers.
                                    <br /><br />
                                    Upgrade to <strong>ADVANCED Seller</strong> to list unlimited products and get priority visibility.
                                </p>
                                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                    <button
                                        onClick={() => setShowLimitModal(false)}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowLimitModal(false);
                                            // TODO: Navigate to upgrade page
                                        }}
                                        className="btn btn-primary"
                                    >
                                        Upgrade Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal - Kept for reference but hidden in UI logic if wanted */}
                    {showDeleteModal && productToDelete && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: "28rem", textAlign: "center" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗑️</div>
                                <h3 style={{ margin: "0 0 1rem", fontSize: "1.5rem" }}>
                                    Delete Product?
                                </h3>
                                <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                                    Are you sure you want to delete <strong>"{productToDelete.name}"</strong>?
                                    <br />
                                    This action cannot be undone.
                                </p>
                                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setProductToDelete(null);
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="btn btn-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
