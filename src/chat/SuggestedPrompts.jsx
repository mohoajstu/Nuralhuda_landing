import React, { useState, useEffect } from 'react';

// Define the prompts map inside the component file
const titleToPromptMap = {
    'nurAlHuda': [
      "Cultivating humility",
      "Islamic lesson of the day",
      "Habits for strengthening faith",
      "Quran's daily life impact",
      "Following Prophet Muhammad (SAW)",
      "Importance of Zakat",
      "Spiritual significance of Hajj",
      "Islam's peace values",
      "Navigating Muslim identity",
      "Dispelling Islam misconceptions",
      "Balancing spirituality and life",
      "Community impact ideas"
    ],
    'nurAlHudaForKids': [
      "Share a Prophet story",
      "Teach a bedtime prayer",
      "Cool Islamic fact",
      "Prophet Muhammad's (SAW) story",
      "Tips for starting to fast",
      "Basic Wudu steps",
      "Good deed ideas",
      "Allah's beautiful world",
      "Being a young Muslim",
      "Fun ways to learn about Islam"
    ],
    'islamicSocraticMethod': ["Explain Tawhid", "What is Islamic Philosophy?", "Tell me about Ijtihad", "Socratic Method!", "Define Sharia", "Purpose of Zakat", "Ethics of War in Islam", "Women's Rights in Islam", "Evolution of Fiqh", "Concept of Ummah"],
  'aiForIslamicResearch': ["Latest research on Islamic History", "AI and Quranic studies", "Islam and Science intersection", "Research Fact!"],
  'iqraWithUs': ["Surah Al-Fatiha", "Discuss Ayat Al-Kursi", "Surah Al-Ikhlas", "Surah Al-Mulk", "Surah Ar-Rahman", "Surah Al-Baqarah:286", "Surah Yasin:9", "Surah Al-Muzzammil:1-4", "Surah Al-Fil", "Surah Al-Asr"],
  'muslimReferenceAI': ["Find a Quranic verse about patience.", "Provide a Hadith on the importance of charity.", "Cite a classical Islamic text discussing Tawhid.", "What does the Quran say about justice?", "Locate a Hadith on the significance of fasting.", "Find a reference from Ghazzali on ethical behavior.", "Provide a Quranic verse about forgiveness.", "What does Sahih Bukhari say about prayer?", "Cite an Islamic scholar on the concept of Ummah.", "Find a Hadith from Sahih Muslim on kindness to neighbors."],
  'paliGPT': ["Overview of Palestinian History", "Key Events in Palestinian Struggle", "Explain Nakba", "Cultural Heritage of Palestine", "Palestinian Cuisine", "Traditional Palestinian Dress", "Important Palestinian Figures", "Impact of Occupation", "Palestinian Refugee Crisis"],
  'fiveDThinking': [
        "Explain the water cycle without attributing it solely to natural processes.",
        "Compare the human eye to a camera to illustrate the intricate design.",
        "Where did the detailed structure of DNA originate from?",
        "Contemplate the interdependence of all life forms and what this signifies about their origin.",
        "What does the lifecycle of a butterfly teach us about patience and transformation?",
        "Describe the functions of the human brain while considering beyond material existence.",
        "Explain the similarities between the ecosystem and a well-maintained garden.",
        "Challenge the concept that the universe came from nothing.",
        "Reflect on the precision of the Earth's distance from the sun and its implications.",
        "How does the cooperation in an ant colony exemplify teamwork and diligence?"
    ]
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
