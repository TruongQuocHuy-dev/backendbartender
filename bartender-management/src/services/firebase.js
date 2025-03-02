import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCpua1YZhbOoHREipvNYvOVbUfpi1wCpXo",
  authDomain: "mixology-9a467.firebaseapp.com",
  databaseURL: "https://mixology-9a467-default-rtdb.firebaseio.com",
  projectId: "mixology-9a467",
  storageBucket: "mixology-9a467.appspot.com",
  messagingSenderId: "570133460824",
  appId: "1:570133460824:web:710e9a9ac26de4a521972d",
  measurementId: "G-TMHFC990KR"
};

const app = initializeApp(firebaseConfig);

// Export các instance
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);