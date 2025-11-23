// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzhT1SATR_R6KFoiT_-2o95xR14yjsZZo",
  authDomain: "briolinkechat.firebaseapp.com",
  projectId: "briolinkechat",
  storageBucket: "briolinkechat.firebasestorage.app",
  messagingSenderId: "232898284627",
  appId: "1:232898284627:web:e91b4710c5934f21620aa6",
  measurementId: "G-3T4TZF32NH"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Analytics (only in browser)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export { app, auth, db, storage, analytics }

