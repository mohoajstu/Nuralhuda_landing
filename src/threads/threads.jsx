// src/Threads.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase-config'; // Ensure path accuracy
import { doc, getDoc } from 'firebase/firestore';
import OpenAI from "openai";

const apiKey = process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA;
const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
});

const assistantLogos = {
  'Iqra With Us': '/path/to/iqra_logo.png',
  'Islamic Socratic Method': '/path/to/islamic_socratic_method_logo.png',
  'Muslim Reference AI': '/path/to/muslim_reference_ai_logo.png',
  'Nur Al Huda': '/path/to/nur_al_huda_logo.png',
  'Nur Al Huda For Kids': '/path/to/nur_al_huda_for_kids_logo.png',
  'PaliGPT': '/path/to/paligpt_logo.png',
};

const Threads = () => {
  const [threads, setThreads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThreads = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is authenticated');
        return;
      }

      const userId = user.uid;
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (!userData) {
        console.error('User data not found');
        return;
      }

      const assistants = Object.keys(userData).filter(key => key !== 'account' && key !== 'email' && key !== 'lastResetDate' && key !== 'paymentStatus' && key !== 'totalPromptCount');
      const fetchedThreads = assistants.flatMap(assistant =>
        userData[assistant]?.Threads?.map(threadId => ({
          assistant,
          threadId,
        })) || []
      );

      const threadDetails = await Promise.all(fetchedThreads.map(async (thread) => {
        const threadDetail = await openai.beta.threads.retrieve(thread.threadId);

        // Fetch all messages
        let allMessages = [];
        let limit = 100;
        let after = null;

        while (true) {
          const response = await openai.beta.threads.messages.list(thread.threadId, { limit, after });
          const messages = response.data;
          if (!messages.length) break;
          allMessages = allMessages.concat(messages);
          after = messages[messages.length - 1].id;
        }

        return {
          ...thread,
          detail: threadDetail,
          messages: allMessages,
          localThreadID: thread.threadId,
        };
      }));

      setThreads(threadDetails);
    };

    fetchThreads();
  }, []);

  const handleThreadClick = (thread) => {
    navigate(`/chat/${thread.assistant}/${thread.localThreadID}`);
  };

  return (
    <div className="threads-list">
      {threads.map((thread, index) => (
        <div key={index} className="thread-item" onClick={() => handleThreadClick(thread)}>
          <img src={assistantLogos[thread.assistant]} alt={`${thread.assistant} logo`} className="thread-logo" />
          <div className="thread-id">{thread.detail.id}</div>
          <div className="thread-created-at">{new Date(thread.detail.created_at * 1000).toLocaleString()}</div>
          <div className="thread-messages">
            {thread.messages.map((message, msgIndex) => (
              <div key={msgIndex} className="thread-message">
                {message.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Threads;
