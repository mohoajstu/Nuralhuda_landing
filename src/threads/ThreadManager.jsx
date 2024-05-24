// ThreadManager.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase-config';

const ThreadManager = () => {
    const [threads, setThreads] = useState([]);
    const [newThreadTitle, setNewThreadTitle] = useState('');

    // Placeholder data
    const placeholderThreads = [
        { id: 1, title: 'Placeholder Thread 1' },
        { id: 2, title: 'Placeholder Thread 2' },
        { id: 3, title: 'Placeholder Thread 3' },
    ];

    useEffect(() => {
        // Uncomment the below code to fetch real data from Firebase
        // const fetchThreads = async () => {
        //     const querySnapshot = await getDocs(collection(db, 'threads'));
        //     const threadsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        //     setThreads(threadsData);
        // };

        // fetchThreads();
        
        // For now, use placeholder data
        setThreads(placeholderThreads);
    }, []);

    const addThread = async () => {
        if (newThreadTitle.trim() !== '') {
            const docRef = await addDoc(collection(db, 'threads'), { title: newThreadTitle });
            setThreads([...threads, { title: newThreadTitle, id: docRef.id }]);
            setNewThreadTitle('');
        }
    };

    const deleteThread = async (id) => {
        await deleteDoc(doc(db, 'threads', id));
        setThreads(threads.filter(thread => thread.id !== id));
    };

    return (
        <div>
            <h2>Threads</h2>
            <input
                type="text"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                placeholder="Enter thread title"
            />
            <button onClick={addThread}>Add Thread</button>
            <ul>
                {threads.map(thread => (
                    <li key={thread.id}>
                        {thread.title}
                        <button onClick={() => deleteThread(thread.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ThreadManager;
