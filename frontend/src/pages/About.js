import React from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiUsers,
  FiTruck,
  FiShield,
  FiAward,
  FiGlobe,
  FiStar,
  FiTarget,
  FiUser,
  FiMail,
  FiPhone,
} from "react-icons/fi";

const About = () => {
  const values = [
    {
      icon: <FiHeart className="h-8 w-8" />,
      title: "Customer First",
      description:
        "Every decision we make starts with asking: How does this benefit our customers?",
    },
    {
      icon: <FiAward className="h-8 w-8" />,
      title: "Quality Promise",
      description:
        "We source premium fabrics and maintain strict quality control for lasting comfort.",
    },
    {
      icon: <FiGlobe className="h-8 w-8" />,
      title: "Sustainability",
      description:
        "Committed to ethical sourcing and reducing our environmental footprint.",
    },
    {
      icon: <FiUsers className="h-8 w-8" />,
      title: "Inclusive Fashion",
      description:
        "Style for everyone - we celebrate diversity in all sizes, ages, and styles.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      event: "Harsh Enterprises founded with a vision for affordable fashion",
    },
    { year: "2021", event: "Launched online platform serving 5 major cities" },
    { year: "2022", event: "Expanded to serve customers across India" },
    { year: "2023", event: "Introduced sustainable clothing line" },
    { year: "2024", event: "Reached 50,000+ happy customers" },
    {
      year: "2025",
      event: "Partnered with local artisans for exclusive collections",
    },
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      description:
        "15 years in fashion retail, passionate about making quality clothing accessible to everyone.",
    },
    {
      name: "Priya Sharma",
      role: "Head of Design",
      description:
        "Fashion design expert who believes in creating timeless pieces that blend comfort with style.",
    },
    {
      name: "Amit Patel",
      role: "Quality Assurance",
      description:
        "Ensures every product meets our high standards before reaching your wardrobe.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Harsh Enterprises
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            More than just clothing - we're crafting confidence, comfort, and
            style for every moment of your life. Since 2020, we've been your
            trusted partner in looking and feeling your absolute best.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Harsh Enterprises began with a simple observation: quality
                  fashion shouldn't break the bank. Our founder, Rajesh Kumar,
                  noticed a gap in the market for stylish, well-made clothing
                  that everyday people could afford.
                </p>
                <p>
                  What started as a small venture has grown into a trusted brand
                  serving thousands of customers across India. We've stayed true
                  to our original mission - making fashion accessible,
                  comfortable, and confidence-boosting for everyone.
                </p>
                <p>
                  Today, we're not just selling clothes; we're building a
                  community of individuals who believe that great style is for
                  everyone, regardless of budget, size, or background.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      50K+
                    </div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      5000+
                    </div>
                    <div className="text-sm text-gray-600">Products Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      4.8★
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      28
                    </div>
                    <div className="text-sm text-gray-600">Cities Served</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FiTarget className="h-8 w-8 text-primary-600 mr-3" />
                <h3 className="text-2xl font-semibold text-gray-900">
                  Our Mission
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To democratize fashion by providing high-quality, stylish
                clothing that's accessible to everyone. We believe great style
                shouldn't be a luxury - it should be a daily joy that boosts
                confidence and expresses individuality.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FiStar className="h-8 w-8 text-primary-600 mr-3" />
                <h3 className="text-2xl font-semibold text-gray-900">
                  Our Vision
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To become India's most trusted fashion destination, known for
                quality, affordability, and exceptional customer service. We
                envision a world where everyone has access to clothing that
                makes them feel confident and comfortable.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our values guide every decision we make, from product selection to
              customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Journey */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From a small idea to serving thousands of customers across India.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                    {milestone.year}
                  </div>
                  <div className="ml-6">
                    <p className="text-gray-800 font-medium">
                      {milestone.event}
                    </p>
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="absolute left-8 mt-16 w-0.5 h-6 bg-primary-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meet Our Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate people behind Harsh Enterprises who work tirelessly
              to bring you the best fashion experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser className="h-10 w-10 text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h4>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Harsh Enterprises?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We go above and beyond to ensure your shopping experience is
              nothing short of exceptional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <FiTruck className="h-10 w-10 text-primary-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Fast & Free Delivery
              </h4>
              <p className="text-gray-600 text-sm">
                Free shipping on orders above ₹999. Express delivery available
                in major cities.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <FiShield className="h-10 w-10 text-primary-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                30-Day Returns
              </h4>
              <p className="text-gray-600 text-sm">
                Not satisfied? Return any item within 30 days for a full refund
                or exchange.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <FiAward className="h-10 w-10 text-primary-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Quality Guarantee
              </h4>
              <p className="text-gray-600 text-sm">
                Every product undergoes strict quality checks before reaching
                your doorstep.
              </p>
            </div>
          </div>
        </div>

        {/* Sustainability Commitment */}
        <div className="mb-20">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Commitment to Sustainability
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We believe fashion should be beautiful without harming our
                planet. That's why we're committed to sustainable practices
                throughout our supply chain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Eco-Friendly Materials
                </h4>
                <p className="text-sm text-gray-600">
                  Sourcing organic and recycled fabrics wherever possible
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">♻️</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Minimal Packaging
                </h4>
                <p className="text-sm text-gray-600">
                  Biodegradable packaging to reduce environmental impact
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Ethical Sourcing
                </h4>
                <p className="text-sm text-gray-600">
                  Fair wages and safe working conditions for all partners
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Carbon Neutral
                </h4>
                <p className="text-sm text-gray-600">
                  Working towards carbon-neutral shipping by 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600">
              Don't just take our word for it - hear from our happy customers!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                "Amazing quality at such affordable prices! The cotton t-shirts
                I ordered feel premium and the fit is perfect. Definitely
                ordering more!"
              </p>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Priya M.</p>
                <p className="text-gray-500">Mumbai</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                "Super fast delivery and excellent customer service. The kids'
                collection is adorable and my daughter loves her new dresses!"
              </p>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Ramesh K.</p>
                <p className="text-gray-500">Delhi</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                "Easy returns policy saved me when I ordered the wrong size. Got
                my exchange within a week. Great experience overall!"
              </p>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Anjali S.</p>
                <p className="text-gray-500">Bangalore</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Connect */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Let's Stay Connected
            </h2>
            <p className="text-gray-600">
              Have questions or just want to say hello? We'd love to hear from
              you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <FiMail className="h-8 w-8 text-primary-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
              <p className="text-gray-600">henterprises850@gmail.com</p>
            </div>

            <div>
              <FiPhone className="h-8 w-8 text-primary-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
              <p className="text-gray-600">+91 6377802634</p>
            </div>

            <div>
              <FiUsers className="h-8 w-8 text-primary-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Follow Us</h4>
              <p className="text-gray-600">@henterprises on social media</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/contact"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
