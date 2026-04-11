import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Step3Report = ({ report }) => {
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report || {};

  const navigate = useNavigate();

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagLine = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities";
    shortTagLine = "Excellent clarity and structured responses";
  } else if (finalScore >= 5) {
    performanceText = "Need improvement and more clarity in your answers";
    shortTagLine = "Good foundation, refine articulation";
  } else {
    performanceText = "Significant improvement required";
    shortTagLine = "Work on clarity and confidence";
  }

  const percentage = (finalScore / 10) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="mb-6 w-full flex items-start gap-4 flex-wrap">
          <button
            onClick={() => navigate("/history")}
            className="mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Interview Analytics
            </h1>
            <p className="text-gray-500 mt-2">
              Track Your Performance Report
            </p>
          </div>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base">
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-4"
        >
          <div className="w-32 h-32 mx-auto">
            <CircularProgressbar
              value={percentage}
              text={`${finalScore}/10`}
              styles={buildStyles({
                textSize: "20px",
                pathColor: "#10b981",
                textColor: "#111827",
                trailColor: "#e5e7eb",
              })}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            {performanceText}
          </h2>
          <p className="text-gray-500">{shortTagLine}</p>
        </motion.div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Skill Breakdown</h3>

          {skills.map((skill, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{skill.label}</span>
                <span>{skill.value}/10</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${skill.value * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 lg:col-span-3">
          <h3 className="text-xl font-semibold mb-4">
            Question-wise Score
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {questionScoreData.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 rounded-xl text-center shadow-sm"
              >
                <p className="font-semibold">{q.name}</p>
                <p className="text-emerald-600 font-bold">
                  {q.score}/10
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Report;