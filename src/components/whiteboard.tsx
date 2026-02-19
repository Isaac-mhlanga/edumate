'use client';
import dynamic from 'next/dynamic';
import { useEditor, type TLSnapshot } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter } from 'next/navigation';
import { X, Minimize2, Maximize2, Mic, MicOff, Circle as RecordIcon, Square as StopIcon, Brush } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const Tldraw = dynamic(
	async () => (await import('@tldraw/tldraw')).Tldraw,
	{
		ssr: false,
	}
);

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function InnerWhiteboard({
	whiteboardId,
	user,
}: {
	whiteboardId: string;
	user: User | null;
}) {
	const editor = useEditor();

	const saveSnapshotToFirestore = useDebouncedCallback((snapshot: TLSnapshot) => {
		const docRef = doc(firestore, 'whiteboards', whiteboardId);
		setDoc(docRef, {
			snapshot,
			sourceId: editor.user.getId(),
		});
	}, 500);

	useEffect(() => {
		if (!user || !editor) return;

		// Set the user's name that appears on the whiteboard
		editor.user.updateUserPreferences({
			name: user.displayName ?? 'Anonymous',
		});
		editor.updateInstanceState({ isReadonly: false, isToolLocked: true });

		let stillAlive = true;

		async function loadInitialData() {
			const docRef = doc(firestore, 'whiteboards', whiteboardId);
			const docSnap = await getDoc(docRef);
			if (stillAlive && docSnap.exists()) {
				const data = docSnap.data();
				if (data?.snapshot) {
					try {
						editor.store.loadSnapshot(data.snapshot);
					} catch (e) {
						console.error('Error loading snapshot:', e);
					}
				}
			}
		}

		loadInitialData();

		// Subscribe to changes from other users
		const unsubscribe = onSnapshot(
			doc(firestore, 'whiteboards', whiteboardId),
			(snapshot) => {
				if (!stillAlive) return;
				const data = snapshot.data();

				if (data?.snapshot && data.sourceId !== editor.user.getId()) {
					try {
						editor.store.loadSnapshot(data.snapshot);
					} catch (e) {
						console.error('Error loading remote snapshot:', e);
					}
				}
			}
		);

		// Save changes to firestore
		const cleanupStoreListener = editor.store.listen(
			(event) => {
				if (event.source === 'user') {
					const snapshot = editor.store.getSnapshot();
					saveSnapshotToFirestore(snapshot);
				}
			},
			{ source: 'user', scope: 'document' }
		);

		return () => {
			stillAlive = false;
			unsubscribe();
			cleanupStoreListener();
		};
	}, [editor, user, whiteboardId, saveSnapshotToFirestore]);

	return null;
}

export function Whiteboard({
	whiteboardId,
	userRole,
}: {
	whiteboardId: string;
	userRole: 'instructor' | 'student' | 'admin' | 'varsity-student';
}) {
	const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const [isMinimized, setIsMinimized] = useState(false);
    
    // New state for audio and recording
    const [isMuted, setIsMuted] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isStylePanelHidden, setIsStylePanelHidden] = useState(false);

	useEffect(() => {
		const auth = getAuth(app);
		const unsubscribe = onAuthStateChanged(auth, setUser);
		return () => unsubscribe();
	}, []);

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-[100]">
                <Button size="lg" onClick={() => setIsMinimized(false)} className="shadow-2xl">
                    <Maximize2 className="mr-2 h-5 w-5" />
                    Whiteboard Session
                </Button>
            </div>
        )
    }

	return (
		<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className='relative w-full h-full rounded-xl overflow-hidden shadow-2xl border'>
                <Tldraw 
                    persistenceKey={whiteboardId}
                    components={{
                        StylePanel: isStylePanelHidden ? () => null : undefined,
                    }}
                    forceMobile={false}
                >
                    <InnerWhiteboard user={user} whiteboardId={whiteboardId} />
                </Tldraw>
                
                <div className="absolute top-1/2 left-4 -translate-y-1/2 z-[1000] flex flex-col items-center gap-2">
                    {userRole === 'instructor' && (
                        <>
                             <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsMuted(prev => !prev)}
                                className="bg-background/80 hover:bg-background rounded-full h-10 w-10"
                            >
                                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-primary" />}
                                <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                            </Button>
                             <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsRecording(prev => !prev)}
                                className={cn("bg-background/80 hover:bg-background rounded-full h-10 w-10", isRecording && "text-destructive border-destructive/50 ring-2 ring-destructive/50")}
                            >
                                {isRecording ? <StopIcon className="h-5 w-5" /> : <RecordIcon className="h-5 w-5" />}
                                <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                            </Button>
                        </>
                    )}

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsStylePanelHidden(prev => !prev)}
                        className={cn(
                            "bg-background/80 hover:bg-background rounded-full h-10 w-10",
                            isStylePanelHidden && "bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400"
                        )}
                    >
                        <Brush className="h-5 w-5" />
                        <span className="sr-only">Toggle Style Panel</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsMinimized(true)}
                        className="bg-background/80 hover:bg-background rounded-full h-10 w-10"
                    >
                        <Minimize2 className="h-5 w-5" />
                        <span className="sr-only">Minimize Whiteboard</span>
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full h-10 w-10"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Exit Whiteboard</span>
                    </Button>
                </div>
            </div>
		</div>
	);
}
