import React from 'react'
import { FaRobot } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";
import {FcGoogle} from "react-icons/fc"
import { motion } from "motion/react"
import { signInWithPopup } from 'firebase/auth';
import {auth, provider } from '../firebase.js';

const Auth = () => {

    const handleGoogleAuth = async() =>{
        try{
            const response = await signInWithPopup(auth, provider);
            console.log(response);
        }catch(error){
            console.log(error);
        }
    }


  return (
    <div className='w-full min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20' >
        <motion.div
        initial={{opacity:0, y: -40}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.50}}
         className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2x1 border border-gray-200 ">
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-black text-white p-2 rounded-lg">
                    <FaRobot />

                </div>
                <h2 className='font-semibold text-lg' >InterviewAI</h2>
            </div>
            <h1 className='text-2xl md:text-3xl font-semibold text-center leading-sung mb-4' >
                Continue With{" "} 
                <span  className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                    <IoSparkles />
                    AI Smart Interview
                </span>
            </h1>

            <motion.button
            whileHover={{opacity:0.9, scale:1.02}}
            whileTap={{opacity:1, scale:0.98}}
            onClick={handleGoogleAuth}
             className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md' >
                <FcGoogle size={20} />
                Continue With Google
            </motion.button>
        </motion.div>
    </div>
  )
}

export default Auth