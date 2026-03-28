import React, { useState } from 'react'

const InterviewPage = () => {
  const [step, setStep] = useState(1) ;
  const [interviewData, setInterviewData] = useState(null);
  return (
    <div className='min-h-screen bg-gray-50'>
      {step === 1 && (<Step1Setup onStart={(data)=>{
        setInterviewData(data);
        setStep(2);
      }}/>)}

      {step === 3 && (<Step2Interview interviewData={interviewData}
      onFinish={(report) => {setInterviewData(report);
        setStep(2);
      }}
      />)}

      {step === 3 && (<step3Report report={interviewData} />)}
    </div>
  )
}

export default InterviewPage