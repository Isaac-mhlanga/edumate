
'use server';

import { z } from 'zod';
import { auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const registerFormSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["student", "instructor", "tutor"]),
});

type RegisterFormInputs = z.infer<typeof registerFormSchema>;

export async function registerUser(data: RegisterFormInputs) {
    // We don't need to validate confirmPassword on the server, just that password exists and is long enough.
    // The schema here is primarily for type safety on the server action.
    const result = registerFormSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: "Invalid form data." };
    }

    const { fullName, email, password, role } = result.data;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update the user's profile with their full name
        await updateProfile(user, { displayName: fullName });
        
        // In a real application, you would save the user's role to a database like Firestore
        // associated with their user UID (user.uid).
        // For example: await db.collection('users').doc(user.uid).set({ role: role, fullName: fullName });
        
        console.log(`User created successfully: ${user.uid}, Role: ${role}`);

        return { success: true, userId: user.uid };

    } catch (error) {
        if (error instanceof FirebaseError) {
            // Handle specific Firebase errors
            if (error.code === 'auth/email-already-in-use') {
                return { success: false, error: 'This email address is already in use.' };
            }
            return { success: false, error: `An error occurred: ${error.message}` };
        }
        
        // Handle other potential errors
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        
        return { success: false, error: 'An unknown error occurred during registration.' };
    }
}
