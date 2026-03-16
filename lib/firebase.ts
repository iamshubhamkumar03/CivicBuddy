import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace these placeholders with your actual Firebase project keys
const firebaseConfig = {
  apiKey: "AIzaSyCjg3ycBfv3AcZOs3eG2n2MmE-397MdFAQ",
  authDomain: "civicbuddy-ea898.firebaseapp.com",
  databaseURL: "https://civicbuddy-ea898-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "civicbuddy-ea898",
  storageBucket: "civicbuddy-ea898.firebasestorage.app",
  messagingSenderId: "185501368298",
  appId: "1:185501368298:web:6ebcf56c4b9ddb1bfdbc93",
  measurementId: "G-26J670HDJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export instances to use them in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();