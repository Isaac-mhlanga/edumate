
'use server';

import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '@/lib/firebase/config';

// Initialize Firebase for server-side use
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


const registerFormSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["student", "instructor", "tutor"]),
});

type RegisterFormInputs = z.infer<typeof registerFormSchema>;

export async function registerUser(data: RegisterFormInputs) {
    const result = registerFormSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: "Invalid form data." };
    }

    const { fullName, email, password, role } = result.data;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });
        
        console.log(`User created successfully: ${user.uid}, Role: ${role}`);

        return { success: true, userId: user.uid };

    } catch (error) {
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/email-already-in-use') {
                return { success: false, error: 'This email address is already in use.' };
            }
            return { success: false, error: `An error occurred: ${error.message}` };
        }
        
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        
        return { success: false, error: 'An unknown error occurred during registration.' };
    }
}
