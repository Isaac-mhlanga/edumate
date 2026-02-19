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

		editor.user.updateUserPreferences({
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

	useEffect(() => {
		const auth = getAuth(app);
		const unsubscribe = onAuthStateChanged(auth, setUser);
		return () => unsubscribe();
	}, []);


	return (
		<div className="relative w-full h-[calc(100vh-12rem)] rounded-lg border overflow-hidden">
			<Tldraw persistenceKey={whiteboardId}>
				<InnerWhiteboard user={user} whiteboardId={whiteboardId} />
			</Tldraw>
		</div>
	);
}
