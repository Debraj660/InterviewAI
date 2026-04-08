import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"


const Step3Report = ({ report }) => {
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const navigate = useNavigate();

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness }
  ];

  let performanceText = "";
  let shortTagLine = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities",
      shortTagLine = "Excellent clarity and structured responses"
  } else if (finalScore >= 5) {
    performanceText = "Need improvement and more clarity in your answers",
      shortTagLine = "Good foundation, refine articulation"
  } else {
    performanceText = "Significance improvement required",
      shortTagLine = "Work on clarity and confidence"
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 
    to-green-50 px-4 sm:px-6 lg:px-10 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center
      sm:justify-between gap-4">
        <div className="mb-10 w-full flex items-start gap-4 flex-wrap">
          <button
            onClick={() => navigate("/history")}
            className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
            <FaArrowLeft className='text-gray-600' />
          </button>

          <div>
            <h1 className='text-3xl font-bold text-gray-800 flex-nowrap'>
              Interview Analytics
            </h1>
            <p className='text-gray-500 mt-2'>
              Track Your Performance Report
            </p>
          </div>
        </div>
        <button
        className='bg-emerald-600 hover:bg-emerald-700 text-white py-3
        rounded-xl shadow-md transition-all duration-300 font-semibold text-sm
        sm:text-text-base'>Download PDF</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="space-y-6">

        </div>
      </div>

    </div>
  )
}

export default Step3Report