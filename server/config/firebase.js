// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCvj1bFo_8OS_ZrDXJWwgoZSrHIs90y-_o",
  authDomain: "interviewai-14aee.firebaseapp.com",
  projectId: "interviewai-14aee",
  storageBucket: "interviewai-14aee.firebasestorage.app",
  messagingSenderId: "3263039131",
  appId: "1:3263039131:web:32f8b1519d05b2b7f1283e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app) ;
const provider = new GoogleAuthProvider();

export {auth, provider} ;