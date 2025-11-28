// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // 🚀 1. เพิ่ม import Realtime Database
import { getAnalytics } from "firebase/analytics";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtVBbOOK0_BFzcKWi6I5fkom_CDjMEWoM",
  authDomain: "water-sensor-12f74.firebaseapp.com",
  databaseURL: "https://water-sensor-12f74-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "water-sensor-12f74",
  storageBucket: "water-sensor-12f74.firebasestorage.app",
  messagingSenderId: "230035419566",
  appId: "1:230035419566:web:ea58014635daf440ac583f",
  measurementId: "G-V7862SX6MC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // 🚀 2. สร้างตัวแปร database
const analytics = getAnalytics(app);

export { database, analytics, app }; // 🚀 3. ส่งออก database ไปใช้
