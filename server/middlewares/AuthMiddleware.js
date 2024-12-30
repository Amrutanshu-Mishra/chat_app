// import { request, response } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken=(request,response,next)=>{
     // console.log(request.cookies);
     const token=request.cookies.jwt;
     // console.log({token});
     if(!token) return response.status(401).send("You are not authenticated!");
     jwt.verify(token,process.env.JWT_KEY,async(err,payload)=>{
          if(err){
               return response.status(403).send("Token is not valid");
          }
          request.userId=payload.userId;
          next();

     })
};

