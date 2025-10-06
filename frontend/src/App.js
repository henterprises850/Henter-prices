import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import SizeGuide from "./pages/SizeGuid";
import Contact from "./pages/Contact";
import ShippingInfo from "./pages/ShippingInfo";
import ReturnExchange from "./pages/ReturnExchanges";
import Faq from "./pages/FAQ";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import OrderSuccess from "./pages/OrderSuccess";
// In your App.js or routing file
import ManageProducts from "./pages/admin/ManageProducts";

import AdminProducts from "./pages/admin/AdminProducts"; // Add this import
// Styles
import "./styles/global.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/Contact" element={<Contact />} />
                <Route path="/FAQ" element={<Faq />} />
                <Route path="/SizeGuide" element={<SizeGuide />} />
                <Route path="/ShippingInfo" element={<ShippingInfo />} />
                <Route path="/ReturnExchange" element={<ReturnExchange />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route
                  path="/order-success/:orderId"
                  element={<OrderSuccess />}
                />
                {/* Admin Routes */}
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route
                  path="/admin/products/manage"
                  element={<ManageProducts />}
                />
              </Routes>
            </main>
            <Footer />
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
