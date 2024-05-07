import React from 'react';

// Define the prompts map inside the component file
const titleToPromptMap = {
  'nurAlHuda': ["Who Are You?", "5 Pillars of Islam", "What is Ramadan?", "New Random Fact!", "Quran's Significance", "Prophet Muhammad", "Zakat Importance", "Islamic Holidays", "Hajj Significance", "Islam on Peace"],
  'nurAlHudaForKids': ["Tell me a story", "Teach me a prayer", "What is Ramadan?", "New Random Fact!", "Story of a Prophet", "Learning to Fast", "Islamic Holidays", "Prayer Basics", "Good Deeds", "Allah's Creations"],
  'islamicSocraticMethod': ["Explain Tawhid", "What is Islamic Philosophy?", "Tell me about Ijtihad", "Socratic Method!", "Define Sharia", "Purpose of Zakat", "Ethics of War in Islam", "Women's Rights in Islam", "Evolution of Fiqh", "Concept of Ummah"],
  'aiForIslamicResearch': ["Latest research on Islamic History", "AI and Quranic studies", "Islam and Science intersection", "Research Fact!"],
  'iqraWithUs': ["Let's read Surah Al-Fatiha", "Discuss Ayat Al-Kursi", "Explore Surah Al-Ikhlas", "Analyze Surah Al-Mulk", "Recite Surah Ar-Rahman", "Study Surah Al-Baqarah:255", "Learn Surah Yasin:9", "Memorize Surah Al-Muzzammil:1-4", "Understand Surah Al-Fil", "Reflect on Surah Al-Asr"]
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
  const allPrompts = getPromptsForType(chatbotType);
  const prompts = getRandomPrompts(allPrompts, 4); // Only select 4 random prompts
  console.log("Randomly selected prompts for Chatbot Type:", prompts); // Log to debug

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