import React from "react";
import { FiShield, FiLock, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FiShield className="h-12 w-12 text-primary-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: October 6, 2025
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed">
                ClothStore ("we," "our," or "us") respects your privacy and is
                committed to protecting your personal information. This Privacy
                Policy explains how we collect, use, disclose, and safeguard
                your information when you visit our website at clothstore.com
                and make purchases from our online store. By using our services,
                you agree to the collection and use of information in accordance
                with this policy [web:105].
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                2.1 Personal Information
              </h3>
              <p className="text-gray-600 mb-4">
                We collect information that you voluntarily provide when you
                [web:102]:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                <li>Create an account or register for our services</li>
                <li>Make a purchase or place an order</li>
                <li>Subscribe to our newsletter or marketing communications</li>
                <li>Contact our customer support</li>
                <li>Participate in surveys, contests, or promotions</li>
                <li>Leave reviews or comments on our website</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">
                2.2 Types of Data Collected
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Account Information
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full name</li>
                    <li>• Email address</li>
                    <li>• Phone number</li>
                    <li>• Password (encrypted)</li>
                    <li>• Date of birth</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Order Information
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Billing and shipping addresses</li>
                    <li>• Payment information</li>
                    <li>• Order history and preferences</li>
                    <li>• Size and color preferences</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3 mt-6">
                2.3 Automatically Collected Information
              </h3>
              <p className="text-gray-600 mb-4">
                When you visit our website, we automatically collect certain
                information about your device and usage [web:105]:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Device information (type, operating system)</li>
                <li>Pages visited and time spent on our website</li>
                <li>Referring website or source</li>
                <li>Shopping behavior and preferences</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-4">
                We use the collected information for the following purposes
                [web:102]:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Order Processing
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Process and fulfill your orders</li>
                    <li>• Handle payments and billing</li>
                    <li>• Arrange shipping and delivery</li>
                    <li>• Send order confirmations and updates</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Customer Service
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Respond to inquiries and support requests</li>
                    <li>• Handle returns and exchanges</li>
                    <li>• Resolve disputes and complaints</li>
                    <li>• Improve our customer service</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Marketing & Personalization
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Send promotional emails and newsletters</li>
                    <li>• Personalize your shopping experience</li>
                    <li>• Show relevant product recommendations</li>
                    <li>• Notify you about sales and new arrivals</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Website Improvement
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Analyze website usage and performance</li>
                    <li>• Conduct research and analytics</li>
                    <li>• Enhance user experience</li>
                    <li>• Prevent fraud and ensure security</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances [web:105]:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-400 pl-4">
                  <h3 className="font-medium text-gray-900">
                    Service Providers
                  </h3>
                  <p className="text-gray-600">
                    We work with trusted third-party service providers who help
                    us operate our business, including payment processors,
                    shipping companies, email service providers, and analytics
                    platforms.
                  </p>
                </div>

                <div className="border-l-4 border-green-400 pl-4">
                  <h3 className="font-medium text-gray-900">
                    Legal Requirements
                  </h3>
                  <p className="text-gray-600">
                    We may disclose your information if required by law, court
                    order, or government request, or to protect our rights,
                    property, or safety of our users.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-400 pl-4">
                  <h3 className="font-medium text-gray-900">
                    Business Transfers
                  </h3>
                  <p className="text-gray-600">
                    In the event of a merger, acquisition, or sale of our
                    business, your information may be transferred as part of
                    that transaction.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiLock className="mr-2 h-6 w-6 text-primary-400" />
                5. Data Security
              </h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational security
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction
                [web:105]:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Technical Safeguards
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• SSL/TLS encryption for data transmission</li>
                    <li>• Secure payment processing (PCI DSS compliant)</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Firewall protection and intrusion detection</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Administrative Safeguards
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Limited access to personal information</li>
                    <li>• Employee training on data protection</li>
                    <li>• Regular monitoring and incident response</li>
                    <li>• Data backup and recovery procedures</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> While we strive to protect your
                  personal information, no method of transmission over the
                  internet or electronic storage is 100% secure. We cannot
                  guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar tracking technologies to enhance your
                browsing experience and analyze website usage [web:102]:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Types of Cookies We Use
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-1">
                        Essential Cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Required for website functionality and cannot be
                        disabled.
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-1">
                        Analytics Cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Help us understand how visitors interact with our
                        website.
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-1">
                        Marketing Cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Used to show you relevant advertisements and promotions.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Managing Cookies
                  </h3>
                  <p className="text-gray-600">
                    You can control cookies through your browser settings.
                    However, disabling certain cookies may affect your ability
                    to use some features of our website.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Your Rights and Choices
              </h2>
              <p className="text-gray-600 mb-4">
                You have certain rights regarding your personal information,
                including [web:105]:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Data Subject Rights
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      • <strong>Access:</strong> Request a copy of your personal
                      information
                    </li>
                    <li>
                      • <strong>Correction:</strong> Update or correct
                      inaccurate information
                    </li>
                    <li>
                      • <strong>Deletion:</strong> Request deletion of your
                      personal information
                    </li>
                    <li>
                      • <strong>Portability:</strong> Receive your data in a
                      structured format
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Communication Preferences
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Unsubscribe from marketing emails</li>
                    <li>• Update notification preferences</li>
                    <li>• Opt-out of promotional communications</li>
                    <li>• Control cookie settings</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>How to Exercise Your Rights:</strong> To exercise any
                  of these rights, please contact us using the information
                  provided in the "Contact Us" section below. We will respond to
                  your request within 30 days.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Data Retention
              </h2>
              <p className="text-gray-600 mb-4">
                We retain your personal information only for as long as
                necessary to fulfill the purposes outlined in this Privacy
                Policy [web:102]:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  Account information: Until you delete your account or request
                  deletion
                </li>
                <li>
                  Order information: 7 years for tax and legal compliance
                  purposes
                </li>
                <li>Marketing communications: Until you unsubscribe</li>
                <li>
                  Website usage data: Up to 2 years for analytics purposes
                </li>
                <li>Customer support records: 3 years after resolution</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-600">
                Our services are not intended for children under the age of 13.
                We do not knowingly collect personal information from children
                under 13. If we become aware that we have collected personal
                information from a child under 13, we will take steps to delete
                such information promptly.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. International Data Transfers
              </h2>
              <p className="text-gray-600">
                Your information may be transferred to and processed in
                countries other than India. When we transfer your information
                internationally, we ensure appropriate safeguards are in place
                to protect your privacy rights in accordance with applicable
                data protection laws.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or for other operational, legal, or
                regulatory reasons. We will notify you of any material changes
                by posting the updated policy on this page and updating the
                "Last updated" date. Your continued use of our services after
                such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Contact Us
              </h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <FiMail className="h-5 w-5 text-primary-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">privacy@clothstore.com</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiPhone className="h-5 w-5 text-primary-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">+91 98765 43210</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FiMapPin className="h-5 w-5 text-primary-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        123 Fashion Street, Mumbai, India 400001
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Data Protection Officer:</strong> For specific data
                    protection inquiries, you may contact our Data Protection
                    Officer at dpo@clothstore.com
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
