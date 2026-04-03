import React, { useState } from 'react'
import { motion } from "motion/react"
import { 
    FaUserTie,
    FaFileUpload,
    FaBriefcase,
    FaMicrophoneAlt,
    FaChartLine
} from "react-icons/fa";
import { IoTimeSharp } from 'react-icons/io5';
import axios from "axios"
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';


export const serverURL = "http://localhost:8000" ;

const Step1Setup = ({onStart }) => {

    const {userData} = useSelector((state) => state.user) ;
    const dispatch = useDispatch();
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleResume = async()=>{
        if(!resumeFile || analyzing) return;
        setAnalyzing(true);

        const formData = new FormData();
        formData.append("resume", resumeFile);

        try{
            const result = await axios.post(serverURL + "/api/interview/resume", formData, {
                withCredentials:true
            });
            console.log(result.data);
            const data = result.data;
            setRole(data.role || "");
            setExperience(data.experience || "");
            setProjects(data.projects || []);
            setSkills(data.skills || []);
            setResumeText(data.resumeText || "");
            setAnalyzing(false);
            setAnalysisDone(true);
        


        }catch(error){
            setAnalyzing(false);
            console.log(error);
        }
    };

    const handleStart = async() =>{
        setLoading(true);
        try{
            const result = await axios.post(serverURL + "/api/interview/generate-questions",
                {role, experience, mode, resumeText, projects, skills}, {withCredentials: true}
            )
            console.log(result.data);
            if(userData) dispatch(setUserData({...userData, credits: result.data.creditsLeft}))

            setLoading(false);
            onStart(result.data);

        }catch(error){
            console.log(error);
        }
    };

  return(
    <motion.div
    initial={{opacity:0}}
    animate={{opacity:1}}
    transition={{duration: 0.6}}
     className='min-h-screen flex items-center justify-center
    bg-gradient-to-br from-gray-100 to-gray-200 px-4'>
        <div className="w-full max-w-6xl bg-white rounded-3xl
        shadow-2xl grid md:grid-cols-2 overflow-hidden">
            <motion.div
            initial={{opacity:0, x:-80}}
            animate={{opacity:1, x:0}}
            transition={{duration:0.6}}
            className='relative bg-gradient-to-br from-green-50 to-green-100
            p-12 flex flex-col justify-center'>
                <h2 className='text-4xl font-bold text-gray-800 mb-6'>
                    Start Your AI Interview
                </h2>

                <p className='text-gray-600 mb-10'>
                    Practice real interview scenarios powered by AI.
                    Improve communications, technical skills and confidence.
                </p>
                
                <div className="space-y-5">
                    {
                        [
                            {
                                icon: <FaUserTie className='text-green-600 text-xl'/>,
                                text: "Choose a role and experience"
                            },
                            {
                                icon: <FaMicrophoneAlt className='text-green-600 text-xl'/>,
                                text: "Smart Voice Interview"
                            },
                            {
                                icon: <FaChartLine className='text-green-600 text-xl'/>,
                                text: "Performance Analysis"
                            }
                        ].map((item, index)=>(
                            <motion.div
                            initial={{opacity:0, y:-30}}
                            animate={{opacity:1, y:0}}
                            transition={{delay: 0.3 + index * 0.15}}
                            whileHover={{scale: 1.03}}
                            className='flex items-center space-x-4 bg-white
                            p-4 rounded-xl shadow-sm cursor-pointer'>
                                {item.icon}
                                <span className='text-gray-700 font-medium'>{item.text}</span>
                            </motion.div>
                        ))
                    }
                </div>
            </motion.div>

            <motion.div
            initial={{opacity: 0, x: 80}}
            animate={{opacity:1, x: 0}}
            transition={{duration: 0.6}}
            className='p-12 bg-white'>
                <h2 className='text-3xl font-bold text-gray-800 mb-8'>
                    Interview Setup
                </h2>

                <div className="space-y-6">
                    <div className="relative">
                        <FaUserTie className='absolute top-1 left-4 text-gray-400'/>
                        <input type="text" placeholder='Enter Role' 
                        className='w-full pl-12 pr-4 px-3 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-green-500 outline-none transition'
                        onChange={(e)=>setRole(e.target.value)} value={role} />

                    </div>
                    <div className="relative">
                        <FaBriefcase className='absolute top-1 left-4 text-gray-400'/>
                        <input type="text" placeholder='Enter Experience (e.g. 1 year)' 
                        className='w-full pl-12 pr-4 px-3 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-green-500 outline-none transition'
                        onChange={(e)=>setExperience(e.target.value)} value={experience} />

                    </div>
                    <div className="relative">
                        <select value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className='w-full py-3 px-4 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-2 focus:ring-green-500 outline-none
                        transition'>
                            <option value="technical">Technical Interview</option>
                            <option value="hr">HR Interview</option>
                       </select>

                       {!analysisDone && (
                            <motion.div
                            whileHover={{scale: 1.02}}
                            onClick={()=> document.getElementById("uploadedResume").click()}
                            className='mt-6 border-2 border-dashed border-gray-300
                            rounded-xl p-8 text-center cursor-pointer hover:border-green-500
                            hover:bg-green-50 transition'>
                                <FaFileUpload className='text-4xl mx-auto text-green-600
                                mb-3'/>
                                <input type="file" accept=".pdf,application/pdf" 
                                id="uploadedResume"
                                className='hidden'
                                onChange={(e)=>setResumeFile(e.target.files[0])} />
                                <p className='text-gray-600 font-medium'>
                                    {resumeFile ? resumeFile.name : "Click to upload resume(optional)"}
                                </p>

                                {resumeFile && (
                                    <motion.button
                                    whileHover={{scale: 1.02}}
                                    onClick={(e)=>{
                                        e.stopPropagation();
                                        handleResume()}
                                    }
                                    className='mt-4 bg-gray-900 text-white
                                    px-5 py-2 rounded-lg hover:bg-gray-800 transition'>
                                        {analyzing ? "Analyzing..." : "Analyze Resume"}
                                    </motion.button>
                                )}

                            </motion.div>
                       )}

                       {analysisDone && (
                        <motion.div
                        initial={{opacity:0, y: 20}}
                        animate={{opacity:1, y:0}}
                            className='bg-gray-50 border border-gray-200
                            rounded-xl p-5 space-y-4 mt-5'>
                                <h3 className='text-lg font-semibold text-gray-800'>
                                    Resume Analysis Result
                                </h3>
                                {projects.length > 0 && (
                                    <div>
                                    <p className='font-medium text-gray-700 mb-1'>
                                        Projects:
                                    </p>
                                    <ul className='list-disc list-inside text-gray-600
                                    space-y-1'>{projects.map((p, i) => (
                                        <li key={i}>{p}</li>
                                    ))}</ul>

                                    </div>
                                    
                                )}
                                {skills.length > 0 && (
                                    <div>
                                    <p className='font-medium text-gray-700 mb-1'>
                                        Skills:
                                    </p>
                                    <div className='flex flex-wrap gap-2'>{skills.map((s, i) => (
                                        <span key={i} className='bg-green-100 
                                        px-3 py-1 rounded-full text-sm gap-2'>{s}</span>
                                    ))}</div>

                                    </div>
                                    
                                )}
                            </motion.div>
                       )}

                       <motion.button 
                       onClick={handleStart}
                        disabled={!role || !experience || loading}
                       className='w-full mt-10 disabled:bg-gray-600 bg-green-600
                       hover:bg-green-700 text-white py-3 rounded-full text-lg
                       font-semibold transition duration-300 shadow-md'>
                        {loading ? "starting..." : "Start Interview"}
                       </motion.button>

                    </div>
                </div>

            </motion.div>
        </div>
    </motion.div>
  )
}
export default Step1Setup