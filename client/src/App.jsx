import React, { useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import Auth from './pages/Auth'
import axios from "axios"

export const serverURL = "http://localhost:8000" ;

const App = () => {
  useEffect(()=>{

    const getUser = async()=>{
      try{

        const result = await axios.get(serverURL + "/api/user/curr-user", 
          {withCredentials:true}
        );
        console.log("working");

        console.log(result.data);
      }catch(error){
        console.log(error);
      }
    }
    getUser();
  }, []);

  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/auth' element={<Auth/>} />
    </Routes>
  )
}

export default App