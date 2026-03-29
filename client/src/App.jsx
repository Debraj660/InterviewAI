import React, { useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import Auth from './pages/Auth'
import axios from "axios"
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'

export const serverURL = "http://localhost:8000" ;

const App = () => {
  const dispatch = useDispatch();
  useEffect(()=>{

    const getUser = async()=>{
      try{

        const result = await axios.get(serverURL + "/api/user/curr-user", 
          {withCredentials:true}
          
        );
        dispatch(setUserData(result.data));
        console.log("working");
        console.log(result.data);
      }catch(error){
        dispatch(setUserData(null));
        console.log(error);
      }
    }
    getUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/auth' element={<Auth/>} />
      <Route path='/interview' element={<InterviewPage/>} />
    </Routes>
  )
}

export default App