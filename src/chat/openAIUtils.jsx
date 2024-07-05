import OpenAI from "openai";

// Mapping of assistant titles to their respective API keys
const assistantApiKeyMap = {
  'Nur Al Huda': process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA,
  'Nur Al Huda For Kids': process.env.REACT_APP_OPENAI_API_KEY_NUR_ALHUDA_FOR_KIDS,
  'Islamic Socratic Method': process.env.REACT_APP_OPENAI_API_KEY_ISLAMIC_SOCRATIC_METHOD,
  'Iqra With Us': process.env.REACT_APP_OPENAI_API_KEY_IQRA_WITH_US,
  'AI for Islamic Research': process.env.REACT_APP_OPENAI_API_KEY_AI_FOR_ISLAMIC_RESEARCH,
  'Muslim Reference AI': process.env.REACT_APP_OPENAI_API_KEY_MUSLIM_REFERENCE_AI,
  'PaliGPT': process.env.REACT_APP_OPENAI_API_KEY_PALIGPT
};

// Function to initialize OpenAI client with the appropriate API key
function initializeOpenAIClient(assistantTitle) {
  const apiKey = assistantApiKeyMap[assistantTitle] || assistantApiKeyMap.default;
  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });
}

let currentStream = null;

export async function createThread(assistantTitle) {
  const openai = initializeOpenAIClient(assistantTitle);
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

export async function createMessage(threadId, newMessage, assistantTitle) {
  const openai = initializeOpenAIClient(assistantTitle);
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

export function createRun(threadId, assistantId, handleMessage, handleError, assistantTitle) {
  if (currentStream) {
    console.warn("A stream is already active, aborting new run initiation.");
    return;
  }

  const openai = initializeOpenAIClient(assistantTitle);

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
  'Muslim Reference AI': "asst_gJad0rJeSMH3s4Uo9oTWjE9y",
  'PaliGPT': "asst_ShMxEdN8gnWONFOVVFv8dKTJ",
  'Quiz Generator': "asst_paDb8Yr8jvqDUmFd2q4n1Fbi" 
};
