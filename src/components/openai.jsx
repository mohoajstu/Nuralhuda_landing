import { Configuration, OpenAIApi } from 'openai';


// add to .env inshallah
const OPENAI_API_KEYS = {

  default: process.env.REACT_APP_OPENAI_API_KEY,
  nurAlHuda: process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA,
  nurAlHudaForKids: process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA_FOR_KIDS,
  islamicSocraticMethod: process.env.REACT_APP_OPENAI_API_KEY_ISLAMIC_SOCRATIC_METHOD,
  aiForIslamicResearch: process.env.REACT_APP_OPENAI_API_KEY_AI_FOR_ISLAMIC_RESEARCH,
  iqraWithUs: process.env.REACT_APP_OPENAI_API_KEY_IQRA_WITH_US
};

// add to .env inshallah
const SYSTEM_PROMPTS = {
    nurAlHuda: process.env.REACT_APP_SYSTEM_PROMPT_NUR_ALHUDA,
    nurAlHudaForKids: process.env.REACT_APP_SYSTEM_PROMPT_NUR_ALHUDA_FOR_KIDS,
    islamicSocraticMethod: process.env.REACT_APP_SYSTEM_PROMPT_ISLAMIC_SOCRATIC_METHOD,
    aiForIslamicResearch: process.env.REACT_APP_SYSTEM_PROMPT_AI_FOR_ISLAMIC_RESEARCH,
    iqraWithUs:  process.env.REACT_APP_SYSTEM_PROMPT_IQRA_WITH_US
   };

  export const fetchChatCompletion = async (message, chatbotType) => {
    try {
      console.log(`Selected chatbot type: ${chatbotType}`);
      let systemPrompt;
    if (chatbotType === 'default') {
      systemPrompt = 'your name is Jeff. you are Jeff.'; // Provide a default system prompt
    } else {
      systemPrompt = SYSTEM_PROMPTS[chatbotType];
    }
      console.log(`Using system prompt: ${systemPrompt}`);
      const apiKey = OPENAI_API_KEYS[chatbotType] || OPENAI_API_KEYS.default;
      console.log(`Using API key: ${apiKey}`);
      if (!systemPrompt) {
        throw new Error('System prompt not found for the specified chatbot type');
      }
  
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": message
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    const jsonResponse = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return jsonResponse.choices[0].message.content;
  }   
     catch (error) {
  console.error('Error fetching response from OpenAI:', error);
  return `Error occurred while fetching response from OpenAI: ${error}`;
}
};
