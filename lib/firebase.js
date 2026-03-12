// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJlYEIMp4ySHHok6hmA3y_qZUx4G9y6kc",
  authDomain: "test-c2d21.firebaseapp.com",
  projectId: "test-c2d21",
  storageBucket: "test-c2d21.firebasestorage.app",
  messagingSenderId: "208721026405",
  appId: "1:208721026405:web:47a7e06af9c45c7ba9558c",
  measurementId: "G-NJRQTTJTF2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

