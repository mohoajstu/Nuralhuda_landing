// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClDXVAo3Mgitt6ochqa_e5EzLA0hNzci4",
  authDomain: "nur-al-huda.firebaseapp.com",
  projectId: "nur-al-huda",
  storageBucket: "nur-al-huda.appspot.com",
  messagingSenderId: "452293581520",
  appId: "1:452293581520:web:9205e6492b6a4866ae9cd5",
  measurementId: "G-V0JH94K8WC"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
//const analytics = getAnalytics(app);
export const  auth = getAuth(app);
