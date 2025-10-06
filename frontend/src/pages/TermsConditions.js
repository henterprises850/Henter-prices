import React from "react";
import { Link } from "react-router-dom";
import { FiFileText, FiShoppingCart, FiCreditCard, FiTruck, FiAlertCircle } from "react-icons/fi";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <FiFileText className="h-12 w-12 text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
            <p className="text-gray-600">Last updated: October 6, 2025</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              Please read these Terms and Conditions carefully before using our website or making any purchase. 
              By accessing or using ClothStore, you agree to be bound by these terms. If you do not agree with 
              any part of these terms, please do not use our services.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <a href="#acceptance" className="block text-primary-600 hover:text-primary-700">1. Acceptance of Terms</a>
            <a href="#account" className="block text-primary-600 hover:text-primary-700">2. Account Registration</a>
            <a href="#products" className="block text-primary-600 hover:text-primary-700">3. Products and Pricing</a>
            <a href="#orders" className="block text-primary-600 hover:text-primary-700">4. Order Placement</a>
            <a href="#payment" className="block text-primary-600 hover:text-primary-700">5. Payment Terms</a>
            <a href="#shipping" className="block text-primary-600 hover:text-primary-700">6. Shipping and Delivery</a>
            <a href="#returns" className="block text-primary-600 hover:text-primary-700">7. Returns and Refunds</a>
            <a href="#intellectual-property" className="block text-primary-600 hover:text-primary-700">8. Intellectual Property</a>
            <a href="#prohibited-uses" className="block text-primary-600 hover:text-primary-700">9. Prohibited Uses</a>
            <a href="#liability" className="block text-primary-600 hover:text-primary-700">10. Limitation of Liability</a>
            <a href="#indemnification" className="block text-primary-600 hover:text-primary-700">11. Indemnification</a>
            <a href="#termination" className="block text-primary-600 hover:text-primary-700">12. Termination</a>
            <a href="#governing-law" className="block text-primary-600 hover:text-primary-700">13. Governing Law</a>
            <a href="#dispute-resolution" className="block text-primary-600 hover:text-primary-700">14. Dispute Resolution</a>
            <a href="#modifications" className="block text-primary-600 hover:text-primary-700">15. Modifications</a>
            <a href="#contact" className="block text-primary-600 hover:text-primary-700">16. Contact Information</a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div id="acceptance" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-3 text-gray-600">
              <p>
                By accessing and using ClothStore ("Website"), you accept and agree to be bound by these Terms 
                and Conditions ("Terms"). These Terms constitute a legally binding agreement between you and 
                ClothStore Pvt. Ltd. ("Company," "we," "us," or "our").
              </p>
              <p>
                Your continued use of the Website signifies your acceptance of these Terms and any updates or 
                modifications we may make from time to time.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div id="account" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Account Registration</h2>
            <div className="space-y-4 text-gray-600">
              <p>To make purchases on our Website, you must create an account. By registering, you agree to:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be at least 18 years of age or have parental/guardian consent</li>
              </ul>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900">
                  <strong>Important:</strong> You are solely responsible for maintaining the confidentiality of 
                  your account credentials. We are not liable for any loss or damage from your failure to 
                  comply with this security obligation.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div id="products" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiShoppingCart className="mr-2 h-6 w-6 text-primary-400" />
              3. Products and Pricing
            </h2>
            <div className="space-y-4 text-gray-600">
              <h3 className="text-lg font-semibold text-gray-900">3.1 Product Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We strive to display products as accurately as possible</li>
                <li>Colors may vary slightly due to monitor settings</li>
                <li>Product descriptions are provided for general information only</li>
                <li>We reserve the right to modify product specifications without notice</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">3.2 Pricing</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes</li>
                <li>Prices are subject to change without prior notice</li>
                <li>We reserve the right to correct pricing errors on our Website</li>
                <li>Promotional offers are valid for limited periods and subject to terms</li>
                <li>Shipping charges are additional unless otherwise stated</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">3.3 Availability</h3>
              <p>
                Product availability is subject to change. We reserve the right to limit quantities or 
                discontinue products. If an item becomes unavailable after your order, we will notify you 
                and offer a refund or substitute product.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div id="orders" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Order Placement</h2>
            <div className="space-y-4 text-gray-600">
              <h3 className="text-lg font-semibold text-gray-900">4.1 Order Process</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Select products and add them to your cart</li>
                <li>Review your order and provide shipping information</li>
                <li>Choose payment method and complete payment</li>
                <li>Receive order confirmation via email</li>
              </ol>

              <h3 className="text-lg font-semibold text-gray-900">4.2 Order Acceptance</h3>
              <p>
                Your receipt of an order confirmation does not signify our acceptance of your order. We reserve 
                the right to accept or decline your order for any reason, including product availability, errors 
                in product or pricing information, or issues with your payment method.
              </p>

              <h3 className="text-lg font-semibold text-gray-900">4.3 Order Modification and Cancellation</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Orders can be cancelled or modified within 2 hours of placement</li>
                <li>Once the order is processed, modifications are not possible</li>
                <li>Contact customer support immediately for urgent changes</li>
                <li>Cancellation after shipment follows our return policy</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div id="payment" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiCreditCard className="mr-2 h-6 w-6 text-primary-400" />
              5. Payment Terms
            </h2>
            <div className="space-y-4 text-gray-600">
              <h3 className="text-lg font-semibold text-gray-900">5.1 Accepted Payment Methods</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Credit/Debit Cards (Visa, Mastercard, Maestro, RuPay)</li>
                <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                <li>Net Banking</li>
                <li>Digital Wallets (Paytm, Mobikwik, etc.)</li>
                <li>Cash on Delivery (COD) - up to ₹5,000 per order</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">5.2 Payment Processing</h3>
              <p>
                All online payments are processed through secure third-party payment gateways. We do not store 
                your complete credit card or banking information on our servers. Payment information is encrypted 
                and handled in compliance with PCI DSS standards.
              </p>

              <h3 className="text-lg font-semibold text-gray-900">5.3 Payment Failures</h3>
              <p>
                If payment fails, your order will not be processed. You will be notified and can retry payment 
                or choose an alternative method. Multiple failed payment attempts may result in temporary 
                suspension of your account for security purposes.
              </p>

              <h3 className="text-lg font-semibold text-gray-900">5.4 Cash on Delivery (COD)</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>COD is available for orders up to ₹5,000</li>
                <li>COD charges may apply (₹49 per order)</li>
                <li>Exact change should be provided to the delivery personnel</li>
                <li>COD orders refused at delivery may incur charges</li>
              </ul>
            </div>
          </div>

          {/* Section 6 */}
          <div id="shipping" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiTruck className="mr-2 h-6 w-6 text-primary-400" />
              6. Shipping and Delivery
            </h2>
            <div className="space-y-4 text-gray-600">
              <h3 className="text-lg font-semibold text-gray-900">6.1 Shipping Areas</h3>
              <p>
                We currently ship to all serviceable areas across India. Remote locations may experience 
                longer delivery times. International shipping is not available at this time.
              </p>

              <h3 className="text-lg font-semibold text-gray-900">6.2 Delivery Timeframes</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left font-medium">Location</th>
                      <th className="border border-gray-200 px-4 py-2 text-left font-medium">Standard</th>
                      <th className="border border-gray-200 px-4 py-2 text-left font-medium">Express</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">Metro Cities</td>
                      <td className="border border-gray-200 px-4 py-2">2-4 business days</td>
                      <td className="border border-gray-200 px-4 py-2">1-2 business days</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">Other Cities</td>
                      <td className="border border-gray-200 px-4 py-2">4-6 business days</td>
                      <td className="border border-gray-200 px-4 py-2">2-3 business days</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">Remote Areas</td>
                      <td className="border border-gray-200 px-4 py-2">6-8 business days</td>
                      <td className="border border-gray-200 px-4 py-2">Not Available</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">6.3 Shipping Charges</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Free standard shipping on orders above ₹999</li>
                <li>₹99 shipping charge for orders below ₹999</li>
                <li>Express delivery available for ₹149 (major cities only)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">6.4 Delivery Issues</h3>
              <p>
                If you are not available at the time of delivery, our courier partner will attempt delivery 
                2-3 times. After failed delivery attempts, the order will be returned to us. Reshipment charges 
                may apply for redelivery.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div id="returns" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Returns and Refunds</h2>
            <div className="space-y-4 text-gray-600">
              <h3 className="text-lg font-semibold text-gray-900">7.1 Return Policy</h3>
              <p>We accept returns within 30 days of delivery for eligible items. To be eligible:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Items must be unused, unworn, and unwashed</li>
                <li>Original tags and packaging must be intact</li>
                <li>Items must not be damaged or altered</li>
                <li>Return request must be initiated within 30 days</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">7.2 Non-Returnable Items</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Undergarments, innerwear, and lingerie</li>
                <li>Personalized or customized products</li>
                <li>Items marked as "Final Sale"</li>
                <li>Products without original tags or packaging</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">7.3 Return Process</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Login to your account and go to "My Orders"</li>
                <li>Select the item you wish to return</li>
                <li>Choose return reason and initiate return request</li>
                <li>Pack items securely in original packaging</li>
                <li>Schedule free pickup from your address</li>
                <li>Hand over the package to our courier partner</li>
              </ol>

              <h3 className="text-lg font-semibold text-gray-900">7.4 Refund Process</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refunds processed within 7-10 business days after item verification</li>
                <li>Refund credited to original payment method</li>
                <li>Bank processing may take additional 3-5 business days</li>
                <li>COD orders refunded via bank transfer or store credit</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">7.5 Exchanges</h3>
              <p>
                Exchanges are subject to stock availability. If the desired size or color is unavailable, 
                we will process a refund instead. Only one exchange is permitted per item.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div id="intellectual-property" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property Rights</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                All content on this Website, including but not limited to text, graphics, logos, images, 
                audio clips, digital downloads, data compilations, and software, is the property of ClothStore 
                or its content suppliers and is protected by Indian and international copyright laws.
              </p>

              <h3 className="text-lg font-semibold text-gray-900">8.1 Trademarks</h3>
              <p>
                "ClothStore" and related logos are registered trademarks. You may not use these trademarks 
                without our prior written permission.
              </p>

              <h3 className="text-lg font-semibold text-gray-900">8.2 Prohibited Uses of Content</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Reproduction, modification, or distribution without permission</li>
                <li>Commercial use of any content without authorization</li>
                <li>Creation of derivative works from our content</li>
                <li>Removing copyright or proprietary notices</li>
              </ul>
            </div>
          </div>

          {/* Section 9 */}
          <div id="prohibited-uses" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiAlertCircle className="mr-2 h-6 w-6 text-red-500" />
              9. Prohibited Uses
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>You agree not to use the Website for any of the following purposes:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-red-900">
                    <li>• Violating any laws or regulations</li>
                    <li>• Transmitting harmful code or viruses</li>
                    <li>• Unauthorized access to systems</li>
                    <li>• Harassment or abuse of others</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-red-900">
                    <li>• Fraudulent activities or scams</li>
                    <li>• Spam or unsolicited advertising</li>
                    <li>• Violation of intellectual property</li>
                    <li>• Data scraping or automated access</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm">
                Violation of these prohibited uses may result in immediate termination of your account and 
                legal action.
              </p>
            </div>
          </div>

          {/* Section 10 */}
          <div id="liability" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                To the fullest extent permitted by law, ClothStore shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of profits, revenue, or data</li>
                <li>Business interruption</li>
                <li>Errors or omissions in content</li>
                <li>Unauthorized access to your data</li>
                <li>Third-party actions or content</li>
              </ul>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Maximum Liability:</strong> Our total liability to you for any claim arising from 
                  your use of the Website shall not exceed the amount you paid for the products giving rise to 
                  the claim, or ₹1,000, whichever is greater.
                </p>
              </div>
            </div>
          </div>

          {/* Section 11 */}
          <div id="indemnification" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                You agree to indemnify, defend, and hold harmless ClothStore, its officers, directors, 
                employees, agents, and affiliates from and against any claims, liabilities, damages, losses, 
                and expenses, including reasonable attorney's fees, arising out of or in any way connected with:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your access to or use of the Website</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you submit or transmit</li>
              </ul>
            </div>
          </div>

          {/* Section 12 */}
          <div id="termination" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We reserve the right to terminate or suspend your account and access to the Website immediately, 
                without prior notice or liability, for any reason, including but not limited to:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Breach of these Terms and Conditions</li>
                <li>Suspected fraudulent activity</li>
                <li>Request by law enforcement</li>
                <li>Extended period of inactivity</li>
                <li>Technical or security concerns</li>
              </ul>

              <p>
                Upon termination, your right to use the Website will immediately cease. All provisions of these 
                Terms that should survive termination shall survive, including ownership provisions, warranty 
                disclaimers, and limitations of liability.
              </p>
            </div>
          </div>

          {/* Section 13 */}
          <div id="governing-law" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of 
                India, without regard to its conflict of law provisions.
              </p>

              <p>
                The following laws and regulations apply to our services:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Information Technology Act, 2000</li>
                <li>Consumer Protection Act, 2019</li>
                <li>Consumer Protection (E-Commerce) Rules, 2020</li>
                <li>Digital Personal Data Protection Act, 2023</li>
                <li>Indian Contract Act, 1872</li>
              </ul>
            </div>
          </div>

          {/* Section 14 */}
          <div id="dispute-resolution" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Dispute Resolution</h2>
            <div className="space-y-4 text-gray-600">
              <h3 className="text-lg font-semibold text-gray-900">14.1 Informal Resolution</h3>
              <p>
                In the event of any dispute, claim, or controversy, you agree to first contact us to attempt 
                to resolve the dispute informally by contacting customer support at support@clothstore.com.
              </p>

              <h3 className="text-lg font-semibold text-gray-900">14.2 Arbitration</h3>
              <p>
                If the dispute cannot be resolved informally, it shall be referred to and finally resolved by 
                arbitration under the Arbitration and Conciliation Act, 1996. The arbitration shall be 
                conducted in Mumbai, Maharashtra, and the language of arbitration shall be English.
              </p>

              <h3 className="text-lg font-semibold text-gray-900">14.3 Jurisdiction</h3>
              <p>
                The courts of Mumbai, Maharashtra shall have exclusive jurisdiction over any disputes arising 
                out of or relating to these Terms and your use of the Website.
              </p>
            </div>
          </div>

          {/* Section 15 */}
          <div id="modifications" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Modifications to Terms</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We reserve the right to modify or replace these Terms at any time at our sole discretion. 
                If a revision is material, we will provide at least 30 days' notice prior to any new terms 
                taking effect.
              </p>

              <p>
                What constitutes a material change will be determined at our sole discretion. By continuing 
                to access or use our Website after revisions become effective, you agree to be bound by the 
                revised terms.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  We encourage you to review these Terms periodically for any changes. The "Last updated" 
                  date at the top of this page indicates when these Terms were last revised.
                </p>
              </div>
            </div>
          </div>

          {/* Section 16 */}
          <div id="contact" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                If you have any questions about these Terms and Conditions, please contact us:
              </p>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3">
                  <p>
                    <strong className="text-gray-900">ClothStore Pvt. Ltd.</strong><br />
                    123 Fashion Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                  <p>
                    <strong className="text-gray-900">Email:</strong> support@clothstore.com<br />
                    <strong className="text-gray-900">Legal:</strong> legal@clothstore.com<br />
                    <strong className="text-gray-900">Phone:</strong> +91 98765 43210
                  </p>
                  <p>
                    <strong className="text-gray-900">Business Hours:</strong><br />
                    Monday - Saturday: 9:00 AM - 8:00 PM IST<br />
                    Sunday: 10:00 AM - 6:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Severability</h3>
          <p className="text-sm text-green-800 mb-4">
            If any provision of these Terms is held to be unenforceable or invalid, such provision will be 
            changed and interpreted to accomplish the objectives of such provision to the greatest extent 
            possible under applicable law, and the remaining provisions will continue in full force and effect.
          </p>

          <h3 className="text-lg font-semibold text-green-900 mb-3">Entire Agreement</h3>
          <p className="text-sm text-green-800">
            These Terms, together with our Privacy Policy and any other legal notices published by us on the 
            Website, shall constitute the entire agreement between you and ClothStore concerning the use of 
            our Website and services.
          </p>
        </div>

        {/* Related Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/privacy"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Privacy Policy →
            </Link>
            <Link
              to="/shipping"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Shipping Policy →
            </Link>
            <Link
              to="/returns"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Return Policy →
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
