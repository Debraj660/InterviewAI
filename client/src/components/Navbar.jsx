import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react"
import {BsCoin, BsRobot } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import {useNavigate} from "react-router-dom"
import { setUserData } from '../redux/userSlice';
import axios from "axios"
import AuthModel from './AuthModel';

const serverURL = "http://localhost:8000" ;

const Navbar = () => {
    const {userData} = useSelector((state)=> state.user) ;
    const [showCreditPopup, setShowCreditPopup] = useState(false);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleLogout = async()=>{
        try{
            await axios.get(serverURL + '/api/auth/logout', 
                {withCredentials: true}
            ) ;
            dispatch(setUserData(null));
            setShowCreditPopup(false);
            setShowUserPopup(false);
            navigate("/");
        }catch(error){
            console.log(error);
        }
    };

  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
        <motion.div 
        initial={{opacity:0, y: -100}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.80}}
        className="w-full max-w-6xl bg-red rounded-3xl  shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative ">
            <div className="flex items-center gap-3 cursor-pointer">
                <div className="bg-black text-white p-2 rounded-lg">
                    <BsRobot/>
                </div>
                <h1 className='font-semibold hidden md:block text-lg' >InterviewAI</h1>
            </div>
            <div className='flex items-center gap-6 relative'>
                <div className="realtive">
                    <button onClick={()=> {
                        if(!userData){
                            setShowAuth(true);
                            return;
                        }
                        setShowCreditPopup(!showCreditPopup);
                        setShowUserPopup(false);

                    }}
                    className='flex items-center gap-2 bg-gray-100
                    px-4 py-4 rounded-full text-md hover:bg-gray-200 transition'>
                        <BsCoin size={20}/>
                        {userData?.credits||0}
                    </button>
                    {showCreditPopup && (
                        <div className="absolute right-[-50px] mt-3 w-64
                        bg-white shadow-xl border border-gray-200 rounded p-5 z-50">
                            <p className='text-sm text-gray-600 mb-4'>
                                Need more credits to continue interviews?
                            </p>
                            <button
                            onClick={()=>navigate("/pricing")}
                            className='w-full bg-black text-white py-6 rounded-lg text-sm'>
                                Buy more Credits
                            </button>
                        </div>
                    )}
                </div>

                <div className='relative' >
                    <button
                    onClick={()=> {
                        if(!userData){
                            setShowAuth(true);
                            return;
                        }
                        setShowUserPopup(!showUserPopup);
                        setShowCreditPopup(false);
                    }}
                    className="w-9 h-9 bg-black text-white rounded-full
                flex items-center justify-center font-semibold">
                    {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut/>}
                    </button>
                    {showUserPopup && (
                        <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200
                        rounded-xl p-4 z-50">
                            <p className='text-md text-blue-500 font-medium mb-1'>{userData?.name}</p>
                            <button
                             onClick={()=> navigate("/history")}
                             className='w-full text-left text-sm py-2 hover:text-black text-gray-600'>
                                History
                             </button>
                            <button 
                            onClick={handleLogout}
                            className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500'>
                                <HiOutlineLogout/> 
                                Logout
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
            {showAuth && <AuthModel onClose={()=> setShowAuth(false)}/>}
        
    </div>
  )
}

export default Navbar