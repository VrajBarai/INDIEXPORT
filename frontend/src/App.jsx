import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BuyerDashboard from "./pages/BuyerDashboard";
import BuyerProfile from "./pages/BuyerProfile";
import ProductBrowse from "./pages/ProductBrowse";
import ProductDetail from "./pages/ProductDetail";
import BuyerInquiries from "./pages/BuyerInquiries";
import BuyerRFQs from "./pages/BuyerRFQs";
import SellerDashboard from "./pages/SellerDashboard";
import SellerOnboarding from "./pages/SellerOnboarding";
import ProductManagement from "./pages/ProductManagement";
import InquiryInbox from "./pages/InquiryInbox";
import InquiryDetail from "./pages/InquiryDetail";
import RFQListing from "./pages/RFQListing";
import RFQDetail from "./pages/RFQDetail";
import InvoiceManagement from "./pages/InvoiceManagement";
import AdminDashboard from "./pages/AdminDashboard";
import BuyerOrders from "./pages/BuyerOrders";
import BuyerOrderDetail from "./pages/BuyerOrderDetail";
import BuyerInvoices from "./pages/BuyerInvoices";
import SellerOrders from "./pages/SellerOrders";
import SellerOrderDetail from "./pages/SellerOrderDetail";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/buyer" element={<BuyerDashboard />} />
        <Route path="/buyer/profile" element={<BuyerProfile />} />
        <Route path="/products/browse" element={<ProductBrowse />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/buyer/inquiries" element={<BuyerInquiries />} />
        <Route path="/buyer/rfqs" element={<BuyerRFQs />} />
        <Route path="/buyer/orders" element={<BuyerOrders />} />
        <Route path="/buyer/orders/:id" element={<BuyerOrderDetail />} />
        <Route path="/buyer/invoices" element={<BuyerInvoices />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/products" element={<ProductManagement />} />
        <Route path="/seller/inquiries" element={<InquiryInbox />} />
        <Route path="/seller/inquiries/:id" element={<InquiryDetail />} />
        <Route path="/seller/rfqs" element={<RFQListing />} />
        <Route path="/seller/rfqs/:id" element={<RFQDetail />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
        <Route path="/seller/invoices" element={<InvoiceManagement />} />
        <Route path="/seller/onboard" element={<SellerOnboarding />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
