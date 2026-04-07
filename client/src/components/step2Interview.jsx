import React from 'react'
import femaleVideo from "../assets/Videos/female-ai.mp4"
import maleVideo from "../assets/Videos/male-ai.mp4"
import Timer from './Timer.jsx';
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import axios from "axios";
import { serverURL } from '../App.jsx';
import { BsArrowLeft } from 'react-icons/bs';


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

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if(!window.speechSynthesis || !selectedVoice){
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      const humanText = text
        .replace(/,/g, ", ...")
        .replace(/\./g, ". ...");

      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        setSubtitle(text);
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);
        if(isMicOn) startMic();
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if(!selectedVoice) return;

    const runIntro = async() => {
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
        if(isMicOn) startMic();
      }
    };
    runIntro();
    
  }, [selectedVoice, isIntroPhase, currentIndex]);

  //timer
  useEffect(()=>{
    if(isIntroPhase) return ;
    if(!currQuestion) return;
    if(isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if(prev <= 1){ clearInterval(timer); return 0 ;}
        return prev - 1;
      })
    }, 1000);

  }, [isIntroPhase, currentIndex, isSubmitting]);

  //voice to text

  useEffect(()=>{
    if(!("webKitSpeechRecognition" in window)) return;

    const recognition = new window.webKitSpeechRecognition();
    recognition.lang = "en-us",
    recognition.continuous = true ;
    recognition.interimResults = false;

    recognition.onresult = (event) =>{
      const transcript = event.results[event.results.length - 1][0].transcript ;
      setAnswer((prev) => prev + " " + transcript);
    }

    recognition.current = recognition ;

  }, []);


  useEffect(()=>{
    if(isIntroPhase) return ;
    if(!currQuestion) return;

    if(timeLeft === 0 && !isSubmitting && !feedback) submitAnswer();

  }, [timeLeft]);


  useEffect(()=>{
    return ()=>{
      if(recognitionRef.current){
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();

    }
  }, []);

  const startMic = ()=>{
    if(recognitionRef.current && !isAIPlaying){
      try{  
        recognitionRef.current.start();

      }catch(error){
        console.log(error);
      }
    }
  };

  const stopMic = ()=>{
    if(recognitionRef.curr){
      try{
        recognitionRef.current.stop();
      }catch(error){
        console.log(error);
      }
    }
  };

  const toggleMic = ()=>{
    if(isMicOn) stopMic();
    else startMic();
    setIsMicOn(!isMicOn);
  }

  const submitAnswer = async()=>{
    if(isSubmitting) return ;
    stopMic();
    setIsSubmitting(true);
    try{
      const result = await axios.post(serverURL + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: currQuestion.timeLimit - timeLeft 
      }, {withCredentials: true});

      setFeedback(result.data.feedback);

      speakText(result.data.feedback);
      setIsSubmitting(false);


    }catch(error){
      console.log(error);
    }
  };

  const handleNext = async()=>{
    setAnswer("");
    setFeedback("");

    if(currentIndex + 1 == questions.length){
      finishInterview();
      return;
    }

    await speakText("Now, We will move to the next question") ;

    setCurrentIndex(currentIndex + 1);

    setTimeout(()=>{
      if(isMicOn) startMic();
    }, 500)

  };

  const finishInterview = async()=>{
    stopMic();
    setIsMicOn(false);

    try{
      const result = await axios.post(serverURL + "/api/interview/finish", {
        interviewId
      }, {withCredentials: true});

      console.log(result.data);
      onFinish(result.data);

    }catch(error){
      console.log(error);
    }

  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>
      
      <div className="w-full max-w-7xl min-h-[85vh] bg-white rounded-3xl shadow-2xl border border-emerald-100 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 gap-6 border-b lg:border-b-0 lg:border-r border-emerald-100">

          {/* Video with subtitle overlaid at bottom */}
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video 
              playsInline
              preload='auto'
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              className='w-full h-[320px] object-cover'
            />

            {/* Subtitle overlay */}
            {isAIPlaying && subtitle && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-3">
                <p className='text-white text-sm font-medium text-center leading-relaxed'>
                  {subtitle}
                </p>
              </div>
            )}
          </div>

          {/* Timer Card */}
          <div className="w-full max-w-md bg-white border border-emerald-100 rounded-2xl shadow-md p-6 space-y-5">
            
            <div className="flex justify-between items-center">
              <span className='text-sm text-gray-500'>Interview Status</span>
              {isAIPlaying && (
                <span className='font-semibold text-sm text-emerald-600'>AI Speaking</span>
              )}
            </div>

            <div className="h-px bg-emerald-50"></div>

            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={currQuestion?.timeLimit || 60} />
            </div>

            <div className="h-px bg-emerald-50"></div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</p>
                <p className='text-xs text-gray-400'>Current Question</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-emerald-600'>{questions.length}</p>
                <p className='text-xs text-gray-400'>Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col p-6 md:p-8">

          <h2 className='text-2xl font-bold text-emerald-600 mb-6'>
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className="flex flex-col flex-1 bg-gray-50 p-6 rounded-2xl border border-emerald-100 shadow-sm gap-4">

              <p className='text-sm text-gray-400'>
                Question {currentIndex + 1} of {questions.length}
              </p>

              <div className="text-lg font-semibold text-gray-800 leading-relaxed">
                {currQuestion?.question}
              </div>

              {/* TEXTAREA */}
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder='Type your answer here...'
                className='flex-1 min-h-[200px] bg-white p-5 rounded-2xl resize-none outline-none border border-emerald-100 focus:ring-2 focus:ring-emerald-400 text-gray-800'
              />

              {/* BUTTONS */}
              {!feedback ? (<div className="flex items-center gap-4">
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMic}
                  className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full shadow-lg transition-colors ${
                    isMicOn
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={submitAnswer}
                  disabled={isSubmitting}
                  className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-4 rounded-2xl shadow-lg hover:opacity-90 transition
                   font-semibold disabled:gray-500'>
                  {isSubmitting ? "Submitting..." : "Submit Answer"}
                </motion.button>

              </div>) : (
                <motion.div className='mt-6 bg-emerald-50 border
                border-emerald-200 p-5 rounded-2xl shadow-sm'>
                  <p className='text-emerald-700 font-medium
                  mb-4'>{feedback}</p>

                  <button
                  onClick={handleNext}
                  className='w-full bg-gradiant-to-r from-emerald-600
                  to-teal-500 text-white py-3 rounded-xl 
                  shadow-md hover:opacity-90 transition flex justify-center items-center'>
                    Next Question <BsArrowLeft size={18}/>
                  </button>
                </motion.div>
              )
              }
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Step2Interview