import React, { useState, useEffect } from 'react';
import { Send, Plus, Bot, User, Stethoscope, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMessages([
        {
          id: 1,
          text: "Hello! I'm MedHelp, your medical assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate header on mount
    gsap.from('.header-content', {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
  
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
  
    try {
      // Add loading state
      setIsLoading(true);
      
      // Call Flask backend
      const response = await fetch('http://localhost:5000/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ msg: inputMessage }),
      });
  
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
  
      const botResponse: Message = {
        id: messages.length + 2,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };
  
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 font-medium"
          >
            Loading MedHelp...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white"
    >
      {/* Header */}
      <header className="bg-white shadow-md">
        <motion.div
          className="header-content max-w-4xl mx-auto px-4 py-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 20 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800">MedHelp</h1>
          </div>
          <p className="mt-2 text-gray-600">Your AI Medical Assistant</p>
        </motion.div>
      </header>

      {/* Main Chat Container */}
      <main className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Chat Messages */}
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`p-4 rounded-lg shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          {message.sender === 'user' ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Bot className="h-5 w-5" />
                          )}
                        </motion.div>
                        <p>{message.text}</p>
                      </div>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <motion.form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-4 bg-gray-50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </motion.button>
              <motion.input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your medical question..."
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-colors"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.form>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          className="mt-4 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>
            ⚕️ This is an AI assistant. For medical emergencies, please call your
            local emergency services or consult a healthcare professional.
          </p>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default App;