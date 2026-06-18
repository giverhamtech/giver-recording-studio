import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "giver-recording-studio.firebaseapp.com",
  projectId: "giver-recording-studio",
  storageBucket: "giver-recording-studio.firebasestorage.app",
  messagingSenderId: "365116469350",
  appId: "1:365116469350:web:f579fd70fea7e80693fda7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;