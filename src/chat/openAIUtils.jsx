import OpenAI from "openai";

// Initialize OpenAI client with the default API key
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA,
  dangerouslyAllowBrowser: true,
});

// Function to create a thread
export async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

// Function to add a message to the thread and get a response
export async function createMessage(threadId, newMessage) {
  try {
    const response = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: newMessage,
    });
    return response;
  } catch (error) {
    console.error("Error sending message to thread:", error);
    throw error;
  }
}

// Function to initiate a run with the assistant

export function createRun(threadId, assistantId, handleMessage, handleError) {
  try {
    const stream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId
    })
    .on('textDelta', (textDelta) => {
      if (textDelta.value) {
        // Handle new message text here
        handleMessage({ sender: 'assistant', text: textDelta.value });
      }
    })
  
    .on('error', (error) => {
      console.error("Stream error:", error);
      if (handleError) {
        handleError(error);
      }
    });

    return stream;

  } catch (error) {
    console.error("Error initiating run with assistant:", error);
    throw error;
  }
}

export const titleToAssistantIDMap = {
  'Nur Al Huda': "asst_0UOsgGXyWL19iwxrR1tqt56p",
  'Nur Al Huda For Kids': "asst_2z9CBAnU88vgmSnZnNHZVaGz",
  'Islamic Socratic Method': "asst_nUrppuSP9pPPjRPHDD3l13bH",
  'Iqra With Us': "asst_NSjlngEyPNwU1PeAcmZZHC9K",
  default: process.env.REACT_APP_NUR_ALHUDA_ASSISTANT_ID,
};