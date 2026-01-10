/**
 * Firebase Authentication Store
 * Manages user authentication state with Firebase Auth
 */

import { create } from 'zustand';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile, initializeDefaultCategories, isUserAdmin } from '../lib/firestore';

export const useFirebaseAuthStore = create((set, get) => ({
    // State
    user: null,
    userProfile: null,
    isAdmin: false,
    loading: true,
    error: null,
    initialized: false,

    // Initialize auth listener
    init: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                let profile = await getUserProfile(firebaseUser.uid);

                // Check if admin
                const adminStatus = await isUserAdmin(firebaseUser.uid);

                set({
                    user: firebaseUser,
                    userProfile: profile,
                    isAdmin: adminStatus,
                    loading: false,
                    initialized: true
                });
            } else {
                // User is signed out
                set({
                    user: null,
                    userProfile: null,
                    isAdmin: false,
                    loading: false,
                    initialized: true
                });
            }
        });

        return unsubscribe;
    },

    // Sign up with email/password
    signUp: async ({ email, password, displayName }) => {
        set({ loading: true, error: null });
        try {
            // Create Firebase auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            if (displayName) {
                await updateProfile(user, { displayName });
            }

            // Create user profile in Firestore
            await createUserProfile(user.uid, {
                email: user.email,
                displayName: displayName || email.split('@')[0],
                isAdmin: false,
                createdAt: new Date().toISOString(),
            });

            // Initialize default categories
            await initializeDefaultCategories(user.uid);

            // Get profile
            const profile = await getUserProfile(user.uid);

            set({
                user,
                userProfile: profile,
                loading: false,
                error: null
            });

            return true;
        } catch (error) {
            let errorMessage = 'Sign up failed';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            }
            set({ loading: false, error: errorMessage });
            return false;
        }
    },

    // Sign in with email/password
    signIn: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get profile
            const profile = await getUserProfile(user.uid);
            const adminStatus = await isUserAdmin(user.uid);

            set({
                user,
                userProfile: profile,
                isAdmin: adminStatus,
                loading: false,
                error: null
            });

            return true;
        } catch (error) {
            let errorMessage = 'Sign in failed';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please try again later.';
            }
            set({ loading: false, error: errorMessage });
            return false;
        }
    },

    // Sign out
    signOut: async () => {
        set({ loading: true, error: null });
        try {
            await signOut(auth);
            set({
                user: null,
                userProfile: null,
                isAdmin: false,
                loading: false
            });
            return true;
        } catch (error) {
            set({ loading: false, error: error.message });
            return false;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Check if authenticated
    isAuthenticated: () => !!get().user,

    // Get current user ID
    getCurrentUserId: () => get().user?.uid || null,

    // Get display name
    getDisplayName: () => get().userProfile?.displayName || get().user?.displayName || get().user?.email || 'User',
}));
