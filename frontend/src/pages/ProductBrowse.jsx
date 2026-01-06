import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { browseProducts } from "../services/productService";
import { getAllCountries } from "../services/productService";

const ProductBrowse = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, searchTerm]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await browseProducts(selectedCategory || null, searchTerm || null);
            setProducts(response.data);

            // Extract unique categories
            const uniqueCategories = [...new Set(response.data.map(p => p.category).filter(Boolean))];
            setCategories(uniqueCategories);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.response?.data?.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    if (loading && products.length === 0) {
        return (
            <div style={{ padding: "50px", textAlign: "center", color: "#666" }}>
                <div>Loading products...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                <h2 style={{ marginBottom: "30px", color: "#1e293b" }}>Browse Products</h2>

                {/* Search and Filters */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    marginBottom: "30px"
                }}>
                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: "1",
                                minWidth: "200px",
                                padding: "12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                fontSize: "14px"
                            }}
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                padding: "12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                fontSize: "14px",
                                minWidth: "150px"
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            style={{
                                padding: "12px 24px",
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Search
                        </button>
                        {(searchTerm || selectedCategory) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("");
                                }}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: "#6b7280",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </form>
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

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📦</div>
                        <p style={{ fontSize: "18px", color: "#64748b" }}>No products found</p>
                        <p style={{ fontSize: "14px", color: "#94a3b8" }}>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "20px"
                    }}>
                        {products.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleProductClick(product.id)}
                                style={{
                                    backgroundColor: "#fff",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    cursor: "pointer",
                                    transition: "transform 0.2s, box-shadow 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                                }}
                            >
                                {product.imageUrl && (
                                    <div style={{
                                        width: "100%",
                                        height: "200px",
                                        backgroundColor: "#f1f5f9",
                                        backgroundImage: `url(${product.imageUrl})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center"
                                    }} />
                                )}
                                <div style={{ padding: "20px" }}>
                                    <h3 style={{
                                        margin: "0 0 10px",
                                        fontSize: "18px",
                                        color: "#1e293b",
                                        fontWeight: "600"
                                    }}>
                                        {product.name}
                                    </h3>
                                    <p style={{
                                        margin: "0 0 10px",
                                        fontSize: "12px",
                                        color: "#64748b"
                                    }}>
                                        {product.category}
                                    </p>
                                    <div style={{ marginBottom: "10px" }}>
                                        <div style={{
                                            fontSize: "24px",
                                            fontWeight: "700",
                                            color: "#1976d2"
                                        }}>
                                            {product.currencySymbol || "$"}{product.convertedPrice?.toFixed(2) || product.price?.toFixed(2)}
                                        </div>
                                        {product.convertedPrice && (
                                            <div style={{
                                                fontSize: "11px",
                                                color: "#94a3b8"
                                            }}>
                                                ₹{product.price?.toFixed(2)} INR
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: "12px",
                                        color: "#64748b",
                                        marginBottom: "10px"
                                    }}>
                                        Seller: {product.sellerBusinessName}
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: "12px"
                                    }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            backgroundColor: product.remainingStock > 0 ? "#dcfce7" : "#fee2e2",
                                            color: product.remainingStock > 0 ? "#166534" : "#b91c1c",
                                            fontWeight: "600"
                                        }}>
                                            {product.remainingStock > 0 ? `In Stock (${product.remainingStock})` : "Out of Stock"}
                                        </span>
                                        <span style={{ color: "#64748b" }}>
                                            Min: {product.minQuantity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductBrowse;

