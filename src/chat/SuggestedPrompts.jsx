import React, { useState, useEffect } from 'react';

// Define the prompts map inside the component file
const titleToPromptMap = {
  'nurAlHuda': ["Who Are You?", "5 Pillars of Islam", "What is Ramadan?", "Give Me A Random Fact", "Quran's Significance", "Prophet Muhammad", "Zakat Importance", "What is Eid?", "Hajj Significance", "Islam on Peace"],
  'nurAlHudaForKids': ["Tell me a story", "Teach me a prayer", "What is Ramadan?", "Give Me A Random Fact", "Story of a Prophet", "Learning to Fast", "What is Eid?", "Prayer Basics", "Good Deeds", "Allah's Creations"],
  'islamicSocraticMethod': ["Explain Tawhid", "What is Islamic Philosophy?", "Tell me about Ijtihad", "Socratic Method!", "Define Sharia", "Purpose of Zakat", "Ethics of War in Islam", "Women's Rights in Islam", "Evolution of Fiqh", "Concept of Ummah"],
  'aiForIslamicResearch': ["Latest research on Islamic History", "AI and Quranic studies", "Islam and Science intersection", "Research Fact!"],
  'iqraWithUs': ["Surah Al-Fatiha", "Discuss Ayat Al-Kursi", "Surah Al-Ikhlas", "Surah Al-Mulk", "Surah Ar-Rahman", "Surah Al-Baqarah:286", "Surah Yasin:9", "Surah Al-Muzzammil:1-4", "Surah Al-Fil", "Surah Al-Asr"],
  'paliGPT': ["Overview of Palestinian History", "Key Events in Palestinian Struggle", "Explain Nakba", "Cultural Heritage of Palestine", "Palestinian Cuisine", "Traditional Palestinian Dress", "Important Palestinian Figures", "Role of UN in Palestine", "Impact of Occupation", "Palestinian Refugee Crisis"]
};

export const getPromptsForType = (chatbotType) => {
  return titleToPromptMap[chatbotType] || ["Fallback prompt if key is incorrect"];
};

// Utility to shuffle array and pick top n elements
const getRandomPrompts = (prompts, count) => {
  const shuffled = prompts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const SuggestedPrompts = ({ onSelectPrompt, isSending, chatbotType }) => {
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    const allPrompts = getPromptsForType(chatbotType);
    const selectedPrompts = getRandomPrompts(allPrompts, 4); // Only select 4 random prompts
    setPrompts(selectedPrompts);
    console.log("Randomly selected prompts for Chatbot Type:", selectedPrompts); // Log to debug
  }, [chatbotType]);  // Dependency array includes chatbotType to update prompts if it changes

  return (
    <div className="chatscreen-prompts-container">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          className="chatscreen-prompt-button"
          onClick={() => onSelectPrompt(prompt)}
          disabled={isSending}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default SuggestedPrompts;
