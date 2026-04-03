import React from 'react'
import femaleVideo from "../assets/Videos/female-ai.mp4"
import maleVideo from "../assets/Videos/male-ai.mp4"
import Timer from './Timer.jsx';
import { motion } from "motion/react"
import { FaMicrophone } from 'react-icons/fa';
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';

const Step2Interview = ({ interviewData, onFinish }) => {

  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const currQuestion = questions[currentIndex];



  useEffect(() =>{
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if(!voices.length) return;
      const femaleVoice = voices.find(v => 
          v.name.toLocaleLowerCase().includes("zira")
          || v.name.toLocaleLowerCase().includes("female")
      );

      if(femaleVoice){
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(v => 
          v.name.toLocaleLowerCase().includes("David")
          || v.name.toLocaleLowerCase().includes("male")
      );

      if(maleVoice){
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;

  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo ;


  // speak function

  const speakText = (text) => {
    return new Promise((resolve) => {
      if(!window.speechSynthesis || !selectedVoice){
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      //adding natural pause
      const humanText = text
      .replace(/,/g, ", ...")
      .replace(/\./g, ". ...");

      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice ; 

      // human like spacing
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1 ;

      utterance.onstart = ()=>{
        setIsAIPlaying(true);
        videoRef.current?.play();
      };

      utterance.onend = ()=>{
        videoRef.current?.pause();
        videoRef.current.currentTime = 0 ;
        setIsAIPlaying(false);

        setTimeout(() => {
          setSubtitle("");
          resolve();

        }, 300);
        setSubtitle(text);
      };

      window.speechSynthesis.speak(utterance);
    })
    

  };

  useEffect(() => {
    if(!selectedVoice) return;

    const runIntro = async() =>{
      if(isIntroPhase){
        await speakText(
          `Hi ${userName}, it's great to meet you. I'll ask you few questions. Just answer naturally. Let's beign`
        );
        setIsIntroPhase(false);
      }
      else if(currQuestion){
        await new Promise(r => setTimeout(r, 800));

        if(currentIndex === questions.length - 1){
          await speakText("This is the last one from my side. It may be more challenging");
        }

        await speakText(currQuestion.question);
      }
    };
    runIntro();
    
  }, [selectedVoice, isIntroPhase, currentIndex]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>
      
      <div className="w-full max-w-7xl min-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT SIDE (Video + Timer) */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 gap-6 border-b lg:border-b-0 lg:border-r border-gray-200">

          {/* Video */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video 
              playsInline
              preload='auto'
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              className='w-full h-[320px] object-cover'
            />
          </div>
          {/* subtitle */}

          <div className="w-full max-w-md bg-gray-50 border
          border-gray-200 rounded-xl p-4 shadow-sm">
            <p className='text-gray-700 text-sm sm:text-base 
            font-medium text-center leading-relaxed'>{subtitle} </p>
          </div>

          {/* Timer Card */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            
            <div className="flex justify-between items-center">
              <span className='text-sm text-gray-500'>Interview Status</span>
              {isAIPlaying && <span className='font-semibold text-sm text-emerald-600'> 
               {isAIPlaying ? "AI Speaking" : ""} </span>}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer timeLeft={30} totalTime={60}/>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className='text-2xl font-bold text-emerald-600'>{currentIndex + 1} </p>
                <p className='text-xs text-gray-400'>Current Question</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-emerald-600'> {questions.length} </p>
                <p className='text-xs text-gray-400'>Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Question + Answer) */}
        <div className="flex-1 flex flex-col p-6 md:p-8">

          <h2 className='text-2xl font-bold text-emerald-600 mb-6'>
            AI Smart Interview
          </h2>

          <div className="flex flex-col flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">

            <p className='text-sm text-gray-400 mb-2'>
              Question {currentIndex + 1} of {questions.length}
            </p>

            <div className="text-lg font-semibold text-gray-800 mb-4 leading-relaxed">
              {currQuestion?.question}
            </div>

            {/* TEXTAREA */}
            <textarea 
              placeholder='Type your answer here...'
              className='flex-1 min-h-[200px] bg-white p-5 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 text-gray-800'
            />

            {/* BUTTONS */}
            <div className="flex items-center gap-4 mt-6">
              
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className='w-14 h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'>
                <FaMicrophone size={20}/>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold'>
                Submit Answer
              </motion.button>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Step2Interview