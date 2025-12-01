import React, { useState, useEffect } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useTheme } from '../ThemeContext';
import { sendChatMessageToChat, getUserChats, getChat } from '../api';

const Chatbot = ({ user }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Olá! Bem-vindo ao Guia UTFPR Apucarana! 🎓 Estou aqui para ajudar com informações sobre o vestibular e campus. O que você gostaria de saber?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { theme } = useTheme();

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) {
        setLoadingHistory(false);
        return;
      }

      try {
        const chats = await getUserChats();
        
        if (chats && chats.length > 0) {
          // Get the most recent chat
          const latestChat = chats[0];
          setCurrentChatId(latestChat.id);
          
          // Load messages from the latest chat
          const chatData = await getChat(latestChat.id);
          
          if (chatData && chatData.messages && chatData.messages.length > 0) {
            const formattedMessages = chatData.messages.map(msg => ({
              sender: msg.role === 'user' ? 'user' : 'bot',
              text: msg.content
            }));
            setMessages(formattedMessages);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        // Keep default welcome message on error
      } finally {
        setLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [user]);

  const handleSendMessage = async (userInput) => {
    const userMessage = { sender: 'user', text: userInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await sendChatMessageToChat(userInput, currentChatId);
      
      // Update chat ID if new chat was created
      if (response.chat_id && response.chat_id !== currentChatId) {
        setCurrentChatId(response.chat_id);
      }
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: response.reply },
      ]);
    } catch (error) {
      console.error("Erro ao buscar resposta do bot:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: "Desculpe, algo deu errado: " + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const bgClass =
    theme === 'dark'
      ? 'bg-[#232324]'
      : 'bg-white';

  // Show loading while fetching history
  if (loadingHistory) {
    return (
      <div className={`flex flex-col w-full h-full items-center justify-center ${bgClass}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Carregando histórico...
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full h-full overflow-hidden transition-all ${bgClass}`}>
      {/* Chat Messages Area - Takes all available space */}
      <div className="flex-1 overflow-y-auto w-full">
        <ChatMessages messages={messages} loading={loading} theme={theme} />
      </div>
      
      {/* Chat Input Area - Fixed at bottom */}
      <div className={`flex-shrink-0 border-t px-4 sm:px-6 py-2 sm:py-3 ${theme === 'dark' ? 'border-gray-700 bg-[#1A1B1C]' : 'border-gray-200 bg-white'}`}>
        <div className="w-full max-w-2xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;