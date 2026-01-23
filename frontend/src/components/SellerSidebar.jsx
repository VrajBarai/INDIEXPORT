import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const SellerSidebar = ({ activeTab, onTabChange }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/");
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ color: "var(--primary)", margin: 0, fontSize: "1.5rem" }}>IndiExport</h3>
                <div className="sidebar-subtitle" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>SELLER PANEL</div>
            </div>

            <nav style={{ flex: 1 }}>
                <ul className="sidebar-nav">
                    {/* Dashboard Link - always goes to root */}
                    <li>
                        <Link to="/seller" className={`sidebar-link ${location.pathname === '/seller' ? 'active' : ''}`}>
                            <span>📊</span>
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/seller/products" className={`sidebar-link ${isActive('/seller/products') ? 'active' : ''}`}>
                            <span>📦</span>
                            <span>Products</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/seller/inquiries" className={`sidebar-link ${isActive('/seller/inquiries') ? 'active' : ''}`}>
                            <span>📩</span>
                            <span>Inquiries</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/seller/orders" className={`sidebar-link ${isActive('/seller/orders') ? 'active' : ''}`}>
                            <span>🛒</span>
                            <span>Orders</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/seller/rfqs" className={`sidebar-link ${isActive('/seller/rfqs') ? 'active' : ''}`}>
                            <span>🤝</span>
                            <span>RFQs</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/seller/invoices" className={`sidebar-link ${isActive('/seller/invoices') ? 'active' : ''}`}>
                            <span>📄</span>
                            <span>Invoices</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
            >
                <span>🚪</span>
                <span>Logout</span>
            </button>
        </div>
    );
};

export default SellerSidebar;
