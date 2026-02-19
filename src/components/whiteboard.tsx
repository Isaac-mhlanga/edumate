'use client';
import dynamic from 'next/dynamic';
import {
	useEditor,
	type TLStore,
	type TLSnapshot,
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import {
	getFirestore,
	doc,
	onSnapshot,
	setDoc,
	getDoc,
	type DocumentReference,
} from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { X } from 'lucide-react';

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

	const [saveSnapshotToFirestore] = useDebounce((snapshot: TLSnapshot) => {
		const docRef = doc(firestore, 'whiteboards', whiteboardId);
		setDoc(docRef, {
			snapshot,
			sourceId: editor.user.getId(),
		});
	}, 500);

	useEffect(() => {
		if (!user || !editor) return;
        
        editor.updateUser({
            name: user.displayName ?? 'Anonymous',
        });


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

	useEffect(() => {
		const auth = getAuth(app);
		const unsubscribe = onAuthStateChanged(auth, setUser);
		return () => unsubscribe();
	}, []);

    const handleExit = () => {
        switch (userRole) {
            case 'instructor':
                router.push('/instructor/whiteboard');
                break;
            case 'admin':
                router.push('/admin/whiteboard');
                break;
            case 'varsity-student':
                 router.push('/varsity-dashboard/whiteboard');
                 break;
            case 'student':
                 router.push('/dashboard');
                 break;
            default:
                router.push('/');
                break;
        }
    };

	return (
		<div className="fixed inset-0 z-[1000]">
            <Button
                onClick={handleExit}
                className="absolute top-4 left-4 z-50 h-10 w-10 p-0 rounded-full"
                variant="secondary"
                aria-label="Exit Whiteboard"
            >
                <X className="h-5 w-5" />
            </Button>
			<Tldraw persistenceKey={whiteboardId}>
				<InnerWhiteboard user={user} whiteboardId={whiteboardId} />
			</Tldraw>
		</div>
	);
}
