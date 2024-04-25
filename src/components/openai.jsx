/*
// Import necessary hooks and dependencies
import { useState } from 'react';
import OpenAI from 'openai';

// Environment variables should be added accordingly
const API_KEYS = {
  default: process.env.REACT_APP_OPENAI_API_KEY,
  nurAlHuda: process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA,
  nurAlHudaForKids: process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA_FOR_KIDS,
  islamicSocraticMethod: process.env.REACT_APP_OPENAI_API_KEY_ISLAMIC_SOCRATIC_METHOD,
  aiForIslamicResearch: process.env.REACT_APP_OPENAI_API_KEY_AI_FOR_ISLAMIC_RESEARCH,
  iqraWithUs: process.env.REACT_APP_OPENAI_API_KEY_IQRA_WITH_US
};

const SYSTEM_PROMPTS = {
  nurAlHuda: process.env.REACT_APP_SYSTEM_PROMPT_NUR_ALHUDA,
  nurAlHudaForKids: process.env.REACT_APP_SYSTEM_PROMPT_NUR_ALHUDA_FOR_KIDS,
  islamicSocraticMethod: process.env.REACT_APP_SYSTEM_PROMPT_ISLAMIC_SOCRATIC_METHOD,
  aiForIslamicResearch: process.env.REACT_APP_SYSTEM_PROMPT_AI_FOR_ISLAMIC_RESEARCH,
  iqraWithUs: process.env.REACT_APP_SYSTEM_PROMPT_IQRA_WITH_US
};

const ASSISTANT_IDS = {
  nurAlHuda: process.env.REACT_APP_NUR_ALHUDA_ASSISTANT_ID,
  nurAlHudaForKids: process.env.REACT_APP_NUR_ALHUDA_FOR_KIDS_ASSISTANT_ID,
  islamicSocraticMethod: process.env.REACT_APP_ISLAMIC_SOCRATIC_METHOD_ASSISTANT_ID,
  aiForIslamicResearch: process.env.REACT_APP_AI_FOR_ISLAMIC_RESEARCH_ASSISTANT_ID,
  iqraWithUs: process.env.REACT_APP_IQRA_WITH_US_ASSISTANT_ID
};


   export const fetchChatCompletion = async (message, chatbotType, setPartialResponse) => {

    try {
      console.log(`Selected chatbot type: ${chatbotType}`);
      let systemPrompt;
    if (chatbotType === 'default') {
      systemPrompt = 'your name is Jeff. you are Jeff.'; // Provide a default system prompt
    } else {
      systemPrompt = SYSTEM_PROMPTS[chatbotType];
    }

    const apiKey = OPENAI_API_KEYS[chatbotType] || OPENAI_API_KEYS.default;
    
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: [{ "role": "system", "content": systemPrompt }, { "role": "user", "content": "Salam!" }],
            stream: true,
          }),
        });
    
        console.log(response);

        const reader = response.body.getReader();
        let partialData = '';
        reader.read().then(function processText({ done, value }) {
          if (done) {
            console.log("Stream complete");
            try {
              // Attempt to parse the accumulated data as JSON
              const jsonData = JSON.parse(partialData);
              // Assuming jsonData is an array of objects
              const contents = jsonData.map(data => data.choices[0].delta.content).filter(content => content);
              setPartialResponse(contents.join(' ')); // Update state with concatenated contents
            } catch (error) {
              console.error('Error parsing JSON from response:', error);
            }
            return;
          }
          const chunk = new TextDecoder().decode(value);
          partialData += chunk;

          console.log(chunk);
          console.log(partialData);
          
          // Optionally parse and update for each chunk
          try {
            // Parse each incoming chunk as JSON
            const chunkData = JSON.parse(chunk);
            if (chunkData.choices && chunkData.choices[0].delta.content) {
              setPartialResponse(chunkData.choices[0].delta.content); // Update state with the content of the current chunk
            }
          } catch (error) {
            // It's possible to receive partial JSON that can't be parsed, which is normal in a streaming context
          }
    
          return reader.read().then(processText);
        });
    
      } catch (error) {
        console.error('Error fetching response from OpenAI:', error);
      }
    };*/