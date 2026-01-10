/**
 * Firebase Configuration and Initialization
 * Project: Aamdhanee (aamdhanee-1af61)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBdsiY8w8hngmqoILy272r1kkaBijtHwms",
    authDomain: "aamdhanee-1af61.firebaseapp.com",
    projectId: "aamdhanee-1af61",
    storageBucket: "aamdhanee-1af61.firebasestorage.app",
    messagingSenderId: "870914910404",
    appId: "1:870914910404:web:bd60da15ac6a97e4e9c191",
    measurementId: "G-J46WD7F6TE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics = null;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});
export { analytics };

// Use emulators in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
