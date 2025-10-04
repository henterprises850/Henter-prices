import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState({});

  const faqData = [
    {
      id: 1,
      category: "orders",
      question: "How do I track my order?",
      answer:
        "You can track your order by logging into your account and visiting the 'My Orders' section. You'll also receive tracking information via email and SMS once your order is shipped.",
    },
    {
      id: 2,
      category: "orders",
      question: "Can I modify or cancel my order?",
      answer:
        "Orders can be modified or cancelled within 2 hours of placing them. After this time, the order enters processing and cannot be changed. Please contact customer support immediately if you need to make changes.",
    },
    {
      id: 3,
      category: "shipping",
      question: "What are the shipping charges?",
      answer:
        "We offer free shipping on orders above ₹999. For orders below ₹999, shipping charges are ₹99. Express delivery (2-3 days) is available for ₹149.",
    },
    {
      id: 4,
      category: "shipping",
      question: "Do you deliver to all locations in India?",
      answer:
        "Yes, we deliver pan-India. However, delivery times may vary based on location. Metro cities typically receive orders in 2-4 days, while remote areas may take 6-8 days.",
    },
    {
      id: 5,
      category: "returns",
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy from the date of delivery. Items must be unused, in original packaging with tags attached. Some items like undergarments and personalized products are not returnable.",
    },
    {
      id: 6,
      category: "returns",
      question: "How do I return an item?",
      answer:
        "Login to your account, go to 'My Orders', select the item you want to return, and click 'Return Item'. We'll arrange free pickup from your address within 2-3 business days.",
    },
    {
      id: 7,
      category: "payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, UPI, net banking, digital wallets, and Cash on Delivery (COD) for orders up to ₹5000.",
    },
    {
      id: 8,
      category: "payment",
      question: "Is it safe to pay online on your website?",
      answer:
        "Yes, absolutely. We use 256-bit SSL encryption and comply with PCI DSS standards. All payment information is securely processed through trusted payment gateways.",
    },
    {
      id: 9,
      category: "sizing",
      question: "How do I find the right size?",
      answer:
        "Please refer to our detailed size guide for each product. Sizes may vary between brands, so always check the specific measurements provided for each item.",
    },
    {
      id: 10,
      category: "sizing",
      question: "What if the size doesn't fit?",
      answer:
        "If the size doesn't fit, you can easily exchange it within 30 days. We offer free pickup and delivery for size exchanges, subject to availability.",
    },
    {
      id: 11,
      category: "account",
      question: "How do I create an account?",
      answer:
        "Click on 'Sign Up' at the top of the page, provide your email and create a password. You can also sign up using your Google or Facebook account for quick registration.",
    },
    {
      id: 12,
      category: "account",
      question: "I forgot my password. How do I reset it?",
      answer:
        "Click on 'Forgot Password' on the login page, enter your registered email address, and we'll send you a password reset link within minutes.",
    },
  ];

  const categories = [
    { id: "all", name: "All Questions", count: faqData.length },
    {
      id: "orders",
      name: "Orders",
      count: faqData.filter((item) => item.category === "orders").length,
    },
    {
      id: "shipping",
      name: "Shipping",
      count: faqData.filter((item) => item.category === "shipping").length,
    },
    {
      id: "returns",
      name: "Returns",
      count: faqData.filter((item) => item.category === "returns").length,
    },
    {
      id: "payment",
      name: "Payment",
      count: faqData.filter((item) => item.category === "payment").length,
    },
    {
      id: "sizing",
      name: "Sizing",
      count: faqData.filter((item) => item.category === "sizing").length,
    },
    {
      id: "account",
      name: "Account",
      count: faqData.filter((item) => item.category === "account").length,
    },
  ];

  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about shopping with ClothStore
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-primary-400 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No questions found matching your search.
              </p>
            </div>
          ) : (
            filteredFAQs.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  {openItems[item.id] ? (
                    <FiChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <FiChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {openItems[item.id] && (
                  <div className="px-6 pb-4">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Still need help?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Our customer support team is
            here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-primary-400 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="tel:+919876543210"
              className="border border-primary-400 text-primary-600 px-6 py-2 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Call Us: +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
