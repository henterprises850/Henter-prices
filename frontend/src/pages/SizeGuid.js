import React, { useState } from "react";
import { FiUsers, FiUser } from "react-icons/fi";

const SizeGuide = () => {
  const [activeCategory, setActiveCategory] = useState("women");

  const sizeCharts = {
    women: {
      tops: [
        { size: "XS", chest: "81-84", waist: "61-64", hip: "86-89" },
        { size: "S", chest: "86-89", waist: "66-69", hip: "91-94" },
        { size: "M", chest: "91-94", waist: "71-74", hip: "96-99" },
        { size: "L", chest: "96-102", waist: "76-82", hip: "101-107" },
        { size: "XL", chest: "107-112", waist: "87-92", hip: "112-117" },
        { size: "XXL", chest: "117-122", waist: "97-102", hip: "122-127" },
      ],
      bottoms: [
        { size: "XS", waist: "61-64", hip: "86-89", inseam: "76" },
        { size: "S", waist: "66-69", hip: "91-94", inseam: "76" },
        { size: "M", waist: "71-74", hip: "96-99", inseam: "78" },
        { size: "L", waist: "76-82", hip: "101-107", inseam: "78" },
        { size: "XL", waist: "87-92", hip: "112-117", inseam: "80" },
        { size: "XXL", waist: "97-102", hip: "122-127", inseam: "80" },
      ],
    },
    men: {
      tops: [
        { size: "S", chest: "91-96", waist: "76-81", shoulder: "44" },
        { size: "M", chest: "97-102", waist: "82-87", shoulder: "46" },
        { size: "L", chest: "103-108", waist: "88-93", shoulder: "48" },
        { size: "XL", chest: "109-114", waist: "94-99", shoulder: "50" },
        { size: "XXL", chest: "115-122", waist: "100-107", shoulder: "52" },
        { size: "XXXL", chest: "123-130", waist: "108-115", shoulder: "54" },
      ],
      bottoms: [
        { size: "S", waist: "76-81", hip: "91-96", inseam: "81" },
        { size: "M", waist: "82-87", hip: "97-102", inseam: "81" },
        { size: "L", waist: "88-93", hip: "103-108", inseam: "83" },
        { size: "XL", waist: "94-99", hip: "109-114", inseam: "83" },
        { size: "XXL", waist: "100-107", hip: "115-122", inseam: "85" },
        { size: "XXXL", waist: "108-115", hip: "123-130", inseam: "85" },
      ],
    },
    kids: {
      tops: [
        { size: "2-3Y", height: "92-98", chest: "53-55", age: "2-3 years" },
        { size: "4-5Y", height: "104-110", chest: "56-58", age: "4-5 years" },
        { size: "6-7Y", height: "116-122", chest: "59-62", age: "6-7 years" },
        { size: "8-9Y", height: "128-134", chest: "63-66", age: "8-9 years" },
        {
          size: "10-11Y",
          height: "140-146",
          chest: "67-71",
          age: "10-11 years",
        },
        {
          size: "12-13Y",
          height: "152-158",
          chest: "72-76",
          age: "12-13 years",
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Size Guide</h1>
          <p className="text-xl text-gray-600">
            Find your perfect fit with our comprehensive sizing charts
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setActiveCategory("women")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeCategory === "women"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Women
            </button>
            <button
              onClick={() => setActiveCategory("men")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeCategory === "men"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Men
            </button>
            <button
              onClick={() => setActiveCategory("kids")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeCategory === "kids"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Kids
            </button>
          </div>
        </div>

        {/* Size Charts */}
        <div className="space-y-8">
          {/* Tops Chart */}
          {sizeCharts[activeCategory].tops && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {activeCategory.charAt(0).toUpperCase() +
                  activeCategory.slice(1)}{" "}
                Tops & Shirts
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                        Size
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                        Chest (cm)
                      </th>
                      {activeCategory !== "kids" && (
                        <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                          Waist (cm)
                        </th>
                      )}
                      {activeCategory === "men" && (
                        <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                          Shoulder (cm)
                        </th>
                      )}
                      {activeCategory === "women" && (
                        <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                          Hip (cm)
                        </th>
                      )}
                      {activeCategory === "kids" && (
                        <>
                          <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                            Height (cm)
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                            Age
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeCharts[activeCategory].tops.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-200 px-4 py-3 font-medium">
                          {row.size}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {row.chest}
                        </td>
                        {activeCategory !== "kids" && (
                          <td className="border border-gray-200 px-4 py-3">
                            {row.waist}
                          </td>
                        )}
                        {activeCategory === "men" && (
                          <td className="border border-gray-200 px-4 py-3">
                            {row.shoulder}
                          </td>
                        )}
                        {activeCategory === "women" && (
                          <td className="border border-gray-200 px-4 py-3">
                            {row.hip}
                          </td>
                        )}
                        {activeCategory === "kids" && (
                          <>
                            <td className="border border-gray-200 px-4 py-3">
                              {row.height}
                            </td>
                            <td className="border border-gray-200 px-4 py-3">
                              {row.age}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottoms Chart */}
          {sizeCharts[activeCategory].bottoms && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {activeCategory.charAt(0).toUpperCase() +
                  activeCategory.slice(1)}{" "}
                Bottoms
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                        Size
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                        Waist (cm)
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                        Hip (cm)
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-900">
                        Inseam (cm)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeCharts[activeCategory].bottoms.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-200 px-4 py-3 font-medium">
                          {row.size}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {row.waist}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {row.hip}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {row.inseam}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* How to Measure */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How to Measure
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                For Best Results:
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Use a soft measuring tape</li>
                <li>• Wear well-fitting undergarments</li>
                <li>• Stand straight with arms at your sides</li>
                <li>• Don't pull the tape too tight or too loose</li>
                <li>• Ask someone to help you measure</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Key Measurements:
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  • <strong>Chest:</strong> Measure around the fullest part
                </li>
                <li>
                  • <strong>Waist:</strong> Measure around the narrowest part
                </li>
                <li>
                  • <strong>Hip:</strong> Measure around the fullest part of
                  hips
                </li>
                <li>
                  • <strong>Inseam:</strong> Measure from crotch to ankle
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
