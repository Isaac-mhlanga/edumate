
'use client';

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, type Auth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { initializeApp, getApps, getApp, FirebaseError } from "firebase/app";
import { User, Mail, KeyRound } from "lucide-react";

// Define the configuration directly for client-side use.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


const registerFormSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string(),
    role: z.enum(["student", "instructor", "tutor", "admin"], { required_error: "Please select a role." }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;


export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [auth, setAuth] = React.useState<Auth | null>(null);

    React.useEffect(() => {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        setAuth(getAuth(app));
    }, []);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        }
    });

    const handleRegister = async (data: RegisterFormValues) => {
        if (!auth) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "Authentication service is not available.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: data.fullName });

            // Send verification email
            await sendEmailVerification(user);

            // Create user document in Firestore
            const db = getFirestore(auth.app);
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                fullName: data.fullName,
                email: data.email,
                role: data.role,
                createdAt: new Date(),
            });

            toast({
                title: "Registration Successful!",
                description: "A verification email has been sent. Please check your inbox.",
            });
            router.push('/login');

        } catch (error) {
             let errorMessage = "An unknown error occurred.";
             if (error instanceof FirebaseError) {
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'This email address is already in use.';
                } else if (error.code === 'auth/invalid-api-key') {
                    errorMessage = 'Firebase API Key is invalid. Please check your configuration.';
                }
                else {
                    errorMessage = `An error occurred: ${error.message}`;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <Card className="bg-slate-800/30 backdrop-blur-md border-white/10 text-white rounded-2xl">
                    <CardHeader className="text-center">
                         <div className="mb-4 flex justify-center">
                            <Link href="/">
                                <Icons.logo className="h-12 w-12 text-emerald-400" />
                            </Link>
                        </div>
                        <CardTitle className="text-2xl text-white">Create an Account</CardTitle>
                        <CardDescription className="text-gray-300">Join Edumate Pro to start your learning journey.</CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleRegister)}>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input placeholder="John Doe" {...field} className="pl-10 bg-slate-700/50 border-white/20 text-white placeholder:text-gray-400 focus:ring-emerald-500" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input placeholder="name@example.com" {...field} className="pl-10 bg-slate-700/50 border-white/20 text-white placeholder:text-gray-400 focus:ring-emerald-500" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input type="password" {...field} className="pl-10 bg-slate-700/50 border-white/20 text-white placeholder:text-gray-400 focus:ring-emerald-500" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input type="password" {...field} className="pl-10 bg-slate-700/50 border-white/20 text-white placeholder:text-gray-400 focus:ring-emerald-500" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                       <FormItem>
                                            <FormLabel>I am a...</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-slate-700/50 border-white/20 text-white placeholder:text-gray-400 focus:ring-emerald-500">
                                                        <SelectValue placeholder="Select your role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="student">Student</SelectItem>
                                                    <SelectItem value="instructor">Instructor</SelectItem>
                                                    <SelectItem value="tutor">Tutor</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl" disabled={isLoading || !auth}>
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                                <div className="text-center text-sm text-gray-300">
                                    Already have an account?{' '}
                                    <Link href="/login" className="font-medium text-emerald-400 hover:underline">
                                        Sign In
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
