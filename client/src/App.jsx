import React, { Children, useEffect } from "react";
import { Button } from "./components/ui/button";  
import { BrowserRouter,Route ,Navigate ,Routes } from "react-router-dom";

import Auth from "./pages/auth";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import { useAppStore } from "./store";
import { useState } from "react";
import { apiClient } from "./lib/api-client";
import { GET_USER_INFO } from "./utils/constants";

const PrivateRoute=({children})=>{ 
  const {userInfo}=useAppStore();
  const isAuthenticated=!(!userInfo);
  console.log(isAuthenticated);
  console.log("Why!")
  return isAuthenticated ? children : <Navigate to="/auth"/>;
}

const AuthRoute=({children})=>{
  const {userInfo}=useAppStore();
  // console.log(userInfo);
  const isAuthenticated=!!userInfo;
  console.log("here12");
  return isAuthenticated ? <Navigate to="/chat"/> : children;
}

const App=()=>{
  
  const {userInfo,setUserInfo}=useAppStore();
  const [loading,setLoading]=useState(true);
  
  useEffect(()=>{
    const getUserData=async()=>{
      try {
        const response=await apiClient.get(GET_USER_INFO,{
          withCredentials:true,
        });
        console.log("try block");
        console.log({response});
        if (response.status===200 && response.data.id) {
          console.log("set hua");
          setUserInfo(response.data);
        }
        else{
          console.log(" nahi set hua")
          setUserInfo(undefined);
        }
      } catch (error) {
        console.log({error});
        setUserInfo(undefined);
      } finally{
        setLoading(false);
      }
    }
    if(!userInfo){
      getUserData();
    }
    else{
      setLoading(false);
    }
  },[userInfo,setUserInfo]);
  
  if(loading){
    return <div>Loading....</div>
  }
  console.log("hey");
  return(
    <BrowserRouter>
      <Routes>
      
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;