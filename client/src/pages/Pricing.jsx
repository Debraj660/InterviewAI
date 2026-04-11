import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  // ✅ selected plan state
  const [selectedPlan, setSelectedPlan] = useState("free");

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: "₹0",
      credits: 100,
      description:
        "Ideal for beginners to explore basic features and get a feel for the platform.",
      features: [
        "100 AI-generated interview questions",
        "Basic performance analytics",
        "Access to community forums",
      ],
    },
    {
      id: "basic",
      name: "Basic Plan",
      price: "₹499",
      credits: 500,
      description:
        "Perfect for regular users who want to enhance their interview preparation.",
      features: [
        "500 AI-generated interview questions",
        "Detailed performance analytics",
        "Priority support",
      ],
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "₹999",
      credits: 1200,
      description:
        "Designed for serious job seekers and professionals.",
      features: [
        "1200 AI-generated interview questions",
        "Advanced performance analytics",
        "1-on-1 coaching sessions",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
        <button
          onClick={() => navigate("/")}
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>

        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)} // ✅ click to select
            className={`cursor-pointer bg-white rounded-3xl shadow-lg p-8 flex flex-col justify-between transition-all duration-300
              ${
                selectedPlan === plan.id
                  ? "border-4 border-emerald-500 scale-105"
                  : "border border-gray-200"
              }`}
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {plan.name}
              </h2>
              <p className="text-gray-500 mt-2">{plan.description}</p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-emerald-600">
                  {plan.price}
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  {plan.credits} Credits
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={plan.id} className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
            className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;