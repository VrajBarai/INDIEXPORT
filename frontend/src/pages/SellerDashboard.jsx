import { useState, useEffect } from "react";
import { getSellerProfile, updateSellerProfile, getSellerAnalytics } from "../services/sellerService";
import { Link } from "react-router-dom";
import SellerSidebar from "../components/SellerSidebar";

const SellerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("profile"); // "profile" or "analytics"

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, analyticsRes] = await Promise.all([
                getSellerProfile().catch(() => ({ data: null })),
                getSellerAnalytics().catch(() => ({ data: null }))
            ]);
            setProfile(profileRes.data);
            setFormData(profileRes.data || {});
            setAnalytics(analyticsRes.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData(profile);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const res = await updateSellerProfile(formData);
            setProfile(res.data);
            setEditing(false);
        } catch (err) {
            setError("Failed to update profile");
        }
    };

    const renderBarChart = (data, maxValue) => {
        if (!data || data.length === 0) return null;
        return (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "200px", marginTop: "20px" }}>
                {data.map((item, idx) => {
                    const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
                    return (
                        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                                width: "100%",
                                backgroundColor: "var(--info)",
                                height: `${height}%`,
                                minHeight: "4px",
                                borderRadius: "4px 4px 0 0",
                                transition: "height 0.3s"
                            }} />
                            <div style={{ fontSize: "10px", marginTop: "5px", color: "var(--text-secondary)", textAlign: "center" }}>
                                {item.month ? item.month.split("-")[1] : idx + 1}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderFunnel = (funnel) => {
        if (!funnel) return null;
        const stages = [
            { label: "Product Views", value: funnel.productViews, color: "#3b82f6", rate: 0 },
            { label: "Inquiries", value: funnel.inquiries, color: "#8b5cf6", rate: funnel.viewToInquiryRate },
            { label: "Chats", value: funnel.chats, color: "#ec4899", rate: funnel.inquiryToChatRate },
            { label: "Invoices", value: funnel.invoices, color: "#10b981", rate: funnel.chatToInvoiceRate }
        ];
        const maxValue = Math.max(...stages.map(s => s.value), 1);

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                {stages.map((stage, idx) => {
                    const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
                    return (
                        <div key={idx}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{stage.label}</span>
                                <span style={{ color: "var(--text-secondary)" }}>{stage.value}</span>
                            </div>
                            <div style={{
                                width: "100%",
                                height: "40px",
                                backgroundColor: "var(--bg-body)",
                                borderRadius: "6px",
                                overflow: "hidden",
                                position: "relative"
                            }}>
                                <div style={{
                                    width: `${width}%`,
                                    height: "100%",
                                    backgroundColor: stage.color,
                                    transition: "width 0.3s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "14px"
                                }}>
                                    {stage.value > 0 && stage.value}
                                </div>
                            </div>
                            {stage.rate > 0 && (
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
                                    Conversion: {stage.rate.toFixed(1)}%
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) return (
        <div className="dashboard-container">
            <SellerSidebar />
            <div className="main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="loader"></div>
            </div>
        </div>
    );

    const isAdvanced = profile?.sellerMode === "ADVANCED";

    return (
        <div className="dashboard-container">
            <SellerSidebar />

            <div className="main-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ margin: 0 }}>Seller Dashboard</h2>
                    <div className="badges" style={{ display: "flex", gap: "10px" }}>
                        <span className={`badge ${isAdvanced ? 'badge-warning' : 'badge-inactive'}`}>
                            {profile?.sellerMode || "BASIC"} SELLER
                        </span>
                        <span className={`badge ${profile?.isVerified ? 'badge-active' : 'badge-error'}`}>
                            {profile?.isVerified ? "VERIFIED" : "UNVERIFIED"}
                        </span>
                    </div>
                </div>

                <div className="tab-nav">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Company Profile
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics & Performance
                    </button>
                </div>

                {activeTab === "profile" ? (
                    <div className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0 }}>Company Profile</h3>
                            {!editing && (
                                <button onClick={handleEdit} className="btn btn-primary">
                                    Edit Profile
                                </button>
                            )}
                            {editing && (
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                                    <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                                </div>
                            )}
                        </div>
                        {error && <div className="badge badge-error" style={{ marginBottom: "1rem" }}>{error}</div>}
                        <div className="grid-2">
                            <Field label="Company Name" value={formData?.businessName} name="businessName" editing={editing} onChange={handleChange} />
                            <Field label="GST Number" value={formData?.gstNumber} name="gstNumber" editing={editing} onChange={handleChange} />
                            <Field label="Business Type" value={formData?.businessType} name="businessType" editing={editing} onChange={handleChange} type="select" options={["Manufacturer", "Wholesaler", "Trader", "Exporter"]} />
                            <div style={{ gridColumn: "1 / -1" }}>
                                <Field label="Address" value={formData?.address} name="address" editing={editing} onChange={handleChange} type="textarea" />
                            </div>
                            <Field label="City" value={formData?.city} name="city" editing={editing} onChange={handleChange} />
                            <Field label="State" value={formData?.state} name="state" editing={editing} onChange={handleChange} />
                            <Field label="Pincode" value={formData?.pincode} name="pincode" editing={editing} onChange={handleChange} />
                            <div className="field-group">
                                <label className="input-label">Country</label>
                                <input value="India" disabled className="input-field" style={{ backgroundColor: "var(--bg-body)", cursor: "not-allowed" }} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Summary Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                            <MetricCard title="Product Views" value={analytics?.totalProductViews || 0} />
                            <MetricCard title="Inquiries" value={analytics?.totalInquiries || 0} />
                            <MetricCard title="RFQs Participated" value={analytics?.totalRFQsParticipated || 0} />
                            <MetricCard title="Active Chats" value={analytics?.totalChatsInitiated || 0} />
                            <MetricCard title="Invoices Generated" value={analytics?.totalInvoicesGenerated || 0} />
                        </div>

                        {isAdvanced && analytics ? (
                            <>
                                {/* Inquiry Growth Chart */}
                                {analytics.inquiryGrowth && analytics.inquiryGrowth.length > 0 && (
                                    <div className="card" style={{ marginBottom: "30px" }}>
                                        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Inquiry Growth</h3>
                                        {renderBarChart(analytics.inquiryGrowth, Math.max(...analytics.inquiryGrowth.map(d => d.count), 1))}
                                    </div>
                                )}

                                {/* Conversion Funnel */}
                                {analytics.conversionFunnel && (
                                    <div className="card" style={{ marginBottom: "30px" }}>
                                        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Conversion Funnel</h3>
                                        {renderFunnel(analytics.conversionFunnel)}
                                    </div>
                                )}

                                {/* Top Products */}
                                {analytics.topProducts && analytics.topProducts.length > 0 && (
                                    <div className="card" style={{ marginBottom: "30px" }}>
                                        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Top Performing Products</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                            {analytics.topProducts.map((product, idx) => (
                                                <div key={idx} style={{ padding: "15px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                                                    <div style={{ fontWeight: "600", marginBottom: "10px" }}>{product.productName}</div>
                                                    <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "var(--text-secondary)" }}>
                                                        <span>Inquiries: {product.inquiryCount}</span>
                                                        <span>Chats: {product.chatCount}</span>
                                                        <span>Invoices: {product.invoiceCount}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {analytics.suggestions && analytics.suggestions.length > 0 && (
                                    <div className="card">
                                        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Actionable Suggestions</h3>
                                        <ul style={{ paddingLeft: "20px" }}>
                                            {analytics.suggestions.map((suggestion, idx) => (
                                                <li key={idx} style={{ marginBottom: "10px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="card">
                                <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>
                                    Upgrade to ADVANCED seller to view detailed analytics, charts, and actionable suggestions.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({ title, value }) => (
    <div className="card" style={{ padding: "20px" }}>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "600" }}>{title}</div>
        <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-main)" }}>{value}</div>
    </div>
);

const Field = ({ label, value, name, editing, onChange, type = "text", options = [] }) => (
    <div className="field-group">
        <label className="input-label">{label}</label>
        {editing ? (
            type === "textarea" ? (
                <textarea name={name} value={value} onChange={onChange} rows="2" className="input-field" style={{ resize: "vertical" }} />
            ) : type === "select" ? (
                <select name={name} value={value} onChange={onChange} className="input-field">
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input type={type} name={name} value={value} onChange={onChange} className="input-field" />
            )
        ) : (
            <div style={{ padding: "10px", fontSize: "14px", color: "var(--text-main)", borderBottom: "1px solid var(--border)" }}>{value || "-"}</div>
        )}
    </div>
);

export default SellerDashboard;
