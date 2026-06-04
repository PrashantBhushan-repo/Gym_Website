import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const postJSON = async (url, data) => {
    const defaultLocalApi = 'http://localhost:5000';
    const envApiUrl = process.env.REACT_APP_API_URL || defaultLocalApi;
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiBaseUrl = isLocalHost ? defaultLocalApi : envApiUrl;

    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Network response was not ok');
    }

    return response.json();
  };
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your AI Fitness Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowQuickActions(false);

    try {
      const response = await postJSON('/api/chat', {
        message: message,
        userId: 'anonymous' // Replace with actual user ID if authenticated
      });

      const botMessage = {
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action) => {
    let message = '';
    let goals = {};

    switch (action) {
      case 'workout':
        message = "I want a personalized workout plan. Can you create one for me?";
        goals = {
          goals: ['Build muscle', 'Improve fitness'],
          experience: 'Beginner',
          daysPerWeek: 3,
          equipment: 'Gym equipment'
        };
        break;
      case 'diet':
        message = "I need a healthy diet plan. Can you suggest one?";
        goals = {
          goals: ['Weight management', 'Healthy eating'],
          calories: 2200,
          preferences: 'Balanced diet'
        };
        break;
      case 'faq':
        message = "What are the gym membership options and pricing?";
        break;
      default:
        return;
    }

    // Send the message
    await handleSend(message);

    // If it's workout or diet, also call the specific endpoint
    if (action === 'workout' || action === 'diet') {
      setIsTyping(true);
      try {
        const endpoint = action === 'workout' ? '/api/workout-plan' : '/api/diet-plan';
        const response = await postJSON(endpoint, {
          userId: 'anonymous',
          [action === 'workout' ? 'goals' : 'preferences']: goals
        });

        const planMessage = {
          text: action === 'workout' ? response.workoutPlan : response.dietPlan,
          sender: 'bot',
          timestamp: new Date(),
          type: 'plan'
        };
        setMessages(prev => [...prev, planMessage]);
      } catch (error) {
        console.error(`Error generating ${action} plan:`, error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const renderMessage = (msg, index) => {
    return (
      <div key={index} className={`message ${msg.sender}`}>
        <div className={`message-content ${msg.type === 'plan' ? 'plan-message' : ''}`}>
          {msg.type === 'plan' ? (
            <div className="plan-content">
              <div className="plan-header">📋 Personalized Plan</div>
              <div className="plan-text">{msg.text}</div>
            </div>
          ) : (
            msg.text
          )}
        </div>
        <div className="message-timestamp">
          {formatTimestamp(msg.timestamp)}
        </div>
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <div className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <div className="chatbot-icon">💪</div>
          <div className="chatbot-label">AI Assistant</div>
        </div>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-info">
              <div className="header-icon">🤖</div>
              <div className="header-text">
                <h3>AI Fitness Assistant</h3>
                <span>Online • Ready to help</span>
              </div>
            </div>
            <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => renderMessage(msg, index))}
            {isTyping && (
              <div className="message bot">
                <div className="message-content typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showQuickActions && messages.length === 1 && (
            <div className="quick-actions">
              <div className="quick-actions-title">Quick Actions:</div>
              <div className="quick-buttons">
                <button
                  className="quick-btn workout-btn"
                  onClick={() => handleQuickAction('workout')}
                >
                  🏋️ Workout Plan
                </button>
                <button
                  className="quick-btn diet-btn"
                  onClick={() => handleQuickAction('diet')}
                >
                  🥗 Diet Plan
                </button>
                <button
                  className="quick-btn faq-btn"
                  onClick={() => handleQuickAction('faq')}
                >
                  ❓ Gym FAQ
                </button>
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about fitness..."
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="send-button"
            >
              {isTyping ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;