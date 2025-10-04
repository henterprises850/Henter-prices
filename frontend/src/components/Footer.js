import React from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-primary-400 mb-4">
              ClothStore
            </h3>
            <p className="text-gray-300 mb-4">
              Your one-stop destination for trendy and affordable clothing for
              men, women, and kids.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FiFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FiTwitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FiInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FiYoutube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Men"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Women"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Kids"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Kids Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/Contact"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/ShippingInfo"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/ReturnExchange"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/SizeGuide"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/FAQ"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <FiMapPin className="h-5 w-5 text-primary-400 mr-2" />
                <span className="text-gray-300">
                  123 Fashion Street, Mumbai, India
                </span>
              </div>
              <div className="flex items-center">
                <FiPhone className="h-5 w-5 text-primary-400 mr-2" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <FiMail className="h-5 w-5 text-primary-400 mr-2" />
                <span className="text-gray-300">support@clothstore.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 ClothStore. All rights reserved. |
            <Link to="/privacy" className="hover:text-primary-400 ml-1">
              Privacy Policy
            </Link>{" "}
            |
            <Link to="/terms" className="hover:text-primary-400 ml-1">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
