import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image} from 'react-native';
//import { createThreadRun } from '../utils/openai';
import loadingDots from './loadingDots'; // Adjust the path according to your file structure
import { fetchChatCompletion } from '../utils/openai';
import ChatBotSelector from './ChatBotSelector';
import { useNavigation } from '@react-navigation/native';


const chatBotInfo = {
    nurAlHuda: {
      logo: require('/Users/mohammedabduljabbar/NurAlHuda/components/images/Nuralhuda_applogo_transparent.png'), // Replace with actual logo path
      description: 'Nur Al Huda: Your guide to spiritual conversations.'
      // Add more chatbots here
    },
    nurAlHudaForKids: {
        logo: require('/Users/mohammedabduljabbar/NurAlHuda/components/images/nuralhudaforkids.png'), // Replace with actual logo path
        description: 'Nur Al Huda for kids: Your guide to spiritual conversations.'
        // Add more chatbots here
      },
      islamicSocraticMethod: {
        logo: require('/Users/mohammedabduljabbar/NurAlHuda/components/images/islamic_socratic_method.png'), // Replace with actual logo path
        description: 'Islamic Socratic Method: Socratic method.'
        // Add more chatbots here
      },
      aiForIslamicResearch: {
        logo: require('/Users/mohammedabduljabbar/NurAlHuda/components/images/Nuralhuda-applogo.png'), // Replace with actual logo path
        description: 'AI For Islamic Research.'
        // Add more chatbots here
      },
      quranCompanion: {
        logo: require('/Users/mohammedabduljabbar/NurAlHuda/components/images/nuralhudalogo.jpg'), // Replace with actual logo path
        description: 'Quran Companion'
        // Add more chatbots here
      },
  };

const SuggestedPrompts = ({ onSelectPrompt }) => {
    const prompts = ["What are the 5 Pillars of Islam?", "What is Ramadan?", "Random Fact!"];
    return (
        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.promptsScrollView}
        contentContainerStyle={styles.promptsContainer}
      >
        {prompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.promptButton}
            onPress={() => onSelectPrompt(prompt)}
          >
            <Text style={styles.promptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };


  
export default function ChatScreen({ route }) {
  const [conversations, setConversations] = useState([{ messages: [] }]);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const scrollViewRef = useRef(null);
  const [showChatBotSelector, setShowChatBotSelector] = useState(false);
  const [selectedChatBot, setSelectedChatBot] = useState('nurAlHuda');
  const navigation = useNavigation();
  const chatbotType = route.params?.chatbotType;
  const [, forceUpdate] = useState();
  const [showChatBotInfo, setShowChatBotInfo] = useState(true);
  const threshold = 1;
// Call this function to force a re-render
const triggerReRender = () => {  
  forceUpdate(n => !n);
};

useEffect(() => {
    console.log('Selected chatbot:', selectedChatBot);
  }, [selectedChatBot]);

  useEffect(() => {
    if (route.params?.chatbotType && chatBotInfo[route.params.chatbotType]) {
      setSelectedChatBot(route.params.chatbotType);
    } else {
      console.warn('Chatbot type from route is undefined or does not match any keys in chatBotInfo.');
    }
  }, [route.params?.chatbotType]);

  
  const handleSendMessage = async (messageToSend) => {
    // Make sure we have a string to trim and send

    const message = typeof messageToSend === 'string' ? messageToSend : currentMessage;
    const trimmedMessage = message.trim();
    
    
    if (trimmedMessage !== '') {
      const updatedConversations = [...conversations];
      updatedConversations[currentConversationIndex].messages.push({ sender: 'user', text: trimmedMessage });
      setConversations(updatedConversations);
      setHasStartedConversation(true);
      setCurrentMessage('');
    
      try {
        const responseText = await fetchChatCompletion(trimmedMessage, chatbotType || selectedChatBot);
        updatedConversations[currentConversationIndex].messages.push({ sender: 'bot', text: responseText });
        setConversations(updatedConversations); // Update the state with the new conversations array
        triggerReRender();
          if (updatedConversations[currentConversationIndex].messages.length > threshold) {
    setShowChatBotInfo(false);
    
  }
      } catch (error) {
        console.error(error);
        updatedConversations[currentConversationIndex].messages.push({ sender: 'bot', text: `Error: ${error.message}` });
        setConversations(updatedConversations);
        triggerReRender();
        if (updatedConversations[currentConversationIndex].messages.length > threshold) {
            setShowChatBotInfo(false);
          }
      }
    }
  };
  

const handleSelectPrompt = (prompt) => {
    setCurrentMessage(prompt);
    handleSendMessage(prompt); // This will auto-send the prompt
  };
  
  const handleSelectThread = (index) => {
    navigation.navigate('Thread', { conversationData: conversations[index] });
  };
  
  const scrollToBottom = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    // The scrollToBottom will be triggered every time conversations change
  }, [conversations]);


  const handleCreateNewThread = () => {
    setConversations([...conversations, { messages: [] }]);
    setCurrentConversationIndex(conversations.length);
  };

  const handleGoToHome = () => {
    navigation.navigate('Home');
  };

  const handleSelectConversation = (index) => {
    setCurrentConversationIndex(index);
  };

  const handleSelectChatBot = (option) => {
    // Set the selected chatbot to the new option
    setSelectedChatBot(option);
  
    // Reset the current message
    setCurrentMessage('');
  
    // Create a new conversation thread
    const newConversations = [...conversations, { messages: [] }];
  
    // Update the conversations array with the new thread
    setConversations(newConversations);
  
    // Set the current conversation index to the new conversation thread
    setCurrentConversationIndex(newConversations.length - 1);
  
    // Close the chatbot selector
    setShowChatBotSelector(false);
  };

  const handleOpenChatBotSelector = () => {
    setShowChatBotSelector(true);
  };

  const handleCloseChatBotSelector = () => {
    setShowChatBotSelector(false);
  };

return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
     
     <View style={styles.mainContainer}>
          {/* Change ChatBot Button */}
          <TouchableOpacity style={styles.changeChatBotButton} onPress={handleOpenChatBotSelector}>
          <Text style={styles.changeChatBotButtonText}>Change ChatBot</Text>
        </TouchableOpacity>
        
        {/* Only render chatbot info if below the threshold */}
        {showChatBotInfo && (
        <View style={styles.chatBotInfoContainer}>
          <Image source={chatBotInfo[selectedChatBot]?.logo} style={styles.chatBotLogo} />
          <Text style={styles.chatBotDescription}>{chatBotInfo[selectedChatBot]?.description}</Text>
        </View>
        )}

        {/* Conversation ScrollView */}
        <ScrollView ref={scrollViewRef} style={styles.conversationContainer} contentContainerStyle={styles.scrollViewContent}>
          {conversations[currentConversationIndex].messages.map((message, index) => (
            <View key={index} style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.userMessage : styles.botMessage,
              ]}>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>
        {/* Wrapper view for prompts and input */}
      <View style={styles.bottomContainer}>
        {/* Suggested Prompts directly above input container */}
        {!hasStartedConversation && (
          <SuggestedPrompts onSelectPrompt={handleSelectPrompt} />
        )}
            {/* Message Input and Send Button */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={currentMessage}
            onChangeText={setCurrentMessage}
            placeholder="Type your message..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
      {/* ChatBot Selector Modal */}
      <ChatBotSelector visible={showChatBotSelector} onSelect={handleSelectChatBot} onClose={handleCloseChatBotSelector} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#DCCA98',
    },
    mainContainer: {
      flex: 1,
      flexDirection: 'column',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    changeChatBotButton: {
      backgroundColor: '#164F48',
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderRadius: 90,
      maxWidth: 168,
      top: 3,              // Distance from the top of the container
      left: 250,     
      marginTop:2,
      marginBottom: 4,
    },
    changeChatBotButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    conversationContainer: {
      flex: 1,
      padding: 16,
    },
    messageContainer: {
      borderRadius: 8,
      padding: 12,
      marginVertical: 4,
      maxWidth: '80%',
      marginBottom: Platform.OS === 'ios' ? 30: 0, // Add some bottom margin on iOS to ensure visibility above the keyboard

    },
    userMessage: {
      backgroundColor: '#e6e6e6',
      alignSelf: 'flex-end',
    },
    botMessage: {
      backgroundColor: '#f2f2f2',
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: 16,
    },

    bottomContainer: {
        justifyContent: 'flex-end',
        // If you have additional padding or margin that might be causing issues, remove them
      },

    inputContainer: {
      flexDirection: 'row',      
      alignItems: 'center',
      paddingHorizontal: 5,
      paddingVertical: 5,
      backgroundColor: '#164F48',
      //marginBottom: Platform.OS === 'ios' ? 30: 0, // Add some bottom margin on iOS to ensure visibility above the keyboard

    },
    input: {
      flex: 1,
      backgroundColor: '#f2f2f2',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 1,
      marginRight: 8,
      
    },
    sendButton: {
      backgroundColor: '#639F65',
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderRadius: 8,
    },
    sendButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    homeButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
      },
      homeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
      chatBotInfoContainer: {
        alignSelf: 'stretch',
        backgroundColor: '#DCCA98',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      chatBotLogo: {
        width: 150,
        height: 200,
      },
      chatBotDescription: {
        fontSize: 16,
        textAlign: 'center',
      },
      promptsScrollView: {
        paddingHorizontal: 16, // Adjust as needed
      },
      promptsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2, // Adjust as needed
      },
      promptButton: {
        backgroundColor: '#164F48', // Customize as desired
        padding: 5,
        borderRadius: 10,
        marginRight: 10, // Spacing between buttons
      },
      promptText: {
        color: '#fff', // Text color
        fontSize: 14, // Reduced font size
      },
      scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-end', // Keep the conversation at the bottom
      },
      
  });