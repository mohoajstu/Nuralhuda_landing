import OpenAI from "openai";

// Initialize OpenAI client with the default API key
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA,
  dangerouslyAllowBrowser: true,
});

let currentStream = null;

export async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

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

export function createRun(threadId, assistantId, handleMessage, handleError) {
  if (currentStream) {
    console.warn("A stream is already active, aborting new run initiation.");
    return;
  }

  try {
    currentStream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    })
      .on('textDelta', (textDelta) => {
        if (textDelta.value) {
          handleMessage({ sender: 'assistant', text: textDelta.value });
        }
      })
      .on('end', () => {
        handleMessage({ sender: 'assistant', text: 'END_TOKEN' });
        currentStream = null; // Reset current stream on end
      })
      .on('error', (error) => {
        console.error("Stream error:", error);
        currentStream = null; // Reset current stream on error
        if (handleError) {
          handleError(error);
        }
      });

    return currentStream;

  } catch (error) {
    console.error("Error initiating run with assistant:", error);
    currentStream = null; // Reset current stream on catch
    throw error;
  }
}

export const titleToAssistantIDMap = {
  'Nur Al Huda': "asst_0UOsgGXyWL19iwxrR1tqt56p",
  'Nur Al Huda For Kids': "asst_2z9CBAnU88vgmSnZnNHZVaGz",
  'Islamic Socratic Method': "asst_nUrppuSP9pPPjRPHDD3l13bH",
  'Iqra With Us': "asst_NSjlngEyPNwU1PeAcmZZHC9K",
  'PaliGPT' : "asst_ShMxEdN8gnWONFOVVFv8dKTJ",
  default: process.env.REACT_APP_NUR_ALHUDA_ASSISTANT_ID,
};
