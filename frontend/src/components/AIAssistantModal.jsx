import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'concierge',
    text: 'Welcome to the Cartiva Concierge. I am your editorial assistant designed to help you discover authentic handcrafted creations, compare studio materials, or curate an ideal gift across our 6 approved artisan studios.',
    recommendations: []
  }
];

const PRESET_PROMPTS = [
  'Recommend a housewarming gift under ₹2,500',
  'What is the best desk setup combination?',
  'Tell me about Terra Stoneware ceramics',
  'Show organic wellness & cork movement gear'
];

export const AIAssistantModal = ({
  isOpen,
  onClose,
  allProducts = [],
  onInspectProduct
}) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const generateEditorialResponse = (query) => {
    const q = query.toLowerCase();
    let replyText = '';
    let matchedProducts = [];

    if (q.includes('gift') || q.includes('housewarming')) {
      replyText =
        'For a warm, memorable gift, I recommend our hand-poured Smoked Cedar Studio Candle by Aethel Botanical paired with handcrafted speckled stoneware coffee cups from Terra Stoneware Studio. Both create an immediate sense of warmth in any living room.';
      matchedProducts = allProducts.filter(
        (p) =>
          p.title.includes('Candle') ||
          p.title.includes('Carafe') ||
          p.title.includes('Mug')
      ).slice(0, 3);
    } else if (q.includes('desk') || q.includes('keyboard') || q.includes('audio')) {
      replyText =
        'For a disciplined, distraction-free workstation, Kanso Sound & Acoustics offers pre-lubricated silent mechanical keyboards and anodized aluminum risers that elevate your laptop to true eye-level while keeping cable clutter to a minimum.';
      matchedProducts = allProducts.filter(
        (p) =>
          p.title.includes('Keyboard') ||
          p.title.includes('Riser') ||
          p.title.includes('Headphones')
      ).slice(0, 3);
    } else if (q.includes('ceramic') || q.includes('terra') || q.includes('kitchen') || q.includes('coffee')) {
      replyText =
        'Terra Stoneware Studio in Khurja fires dark river stoneware at 1280°C. Their speckled ceramic pour-over carafe and hand-pinched matcha bowl feature unglazed tactile pedestals that highlight the raw texture of high-fire clay.';
      matchedProducts = allProducts.filter((p) => p.category === 'Home & Kitchen').slice(0, 3);
    } else if (q.includes('wellness') || q.includes('cork') || q.includes('fitness') || q.includes('yoga')) {
      replyText =
        'Prana Movement Lab utilizes non-synthetic Vietnamese tree rubber bonded to organic Mediterranean cork. Unlike plastic mats, cork provides sweat-activated natural grip and anti-microbial longevity.';
      matchedProducts = allProducts.filter((p) => p.category === 'Fitness').slice(0, 3);
    } else if (q.includes('leather') || q.includes('bag') || q.includes('nomad')) {
      replyText =
        'Nomad Leather Atelier hand-burnishes Tuscan vegetable-tanned leather duffels and cardholders with unbleached beeswax. They are engineered to patina gracefully over decades of travel.';
      matchedProducts = allProducts.filter((p) => p.category === 'Fashion').slice(0, 3);
    } else {
      replyText = `I have explored our master catalogue for "${query}". Here are authentic pieces matching your inquiry across our verified artisan studios:`;
      matchedProducts = allProducts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.storeName && p.storeName.toLowerCase().includes(q))
        )
        .slice(0, 3);

      if (matchedProducts.length === 0) {
        matchedProducts = allProducts.slice(0, 3);
      }
    }

    return { text: replyText, recommendations: matchedProducts };
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      recommendations: []
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateEditorialResponse(text);
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'concierge',
        text: response.text,
        recommendations: response.recommendations
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    addToast(`Added "${product.title}" to bag`, 'success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="ai-assistant-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="concierge-title"
      >
        {/* Header */}
        <div className="concierge-header">
          <div className="concierge-title-group">
            <div className="concierge-avatar-icon">
              <Bot size={20} />
            </div>
            <div>
              <h2 id="concierge-title" className="concierge-title">
                Cartiva Concierge
              </h2>
              <span className="concierge-status">
                <span className="concierge-online-dot" />
                <span>Editorial Shopping Assistant • Live Catalogue Connected</span>
              </span>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close assistant">
            <X size={20} />
          </button>
        </div>

        {/* Message Log */}
        <div className="concierge-messages-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`concierge-msg-row ${msg.sender}`}>
              <div className="msg-avatar">
                {msg.sender === 'concierge' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="msg-bubble">
                <p className="msg-text">{msg.text}</p>

                {/* Recommendations in Bubble */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="msg-recommendations-list">
                    {msg.recommendations.map((prod) => (
                      <div key={prod._id} className="concierge-rec-card">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          onClick={() => {
                            onInspectProduct(prod);
                            onClose();
                          }}
                        />
                        <div className="rec-info">
                          <span className="rec-store">{prod.storeName}</span>
                          <h4
                            className="rec-title"
                            onClick={() => {
                              onInspectProduct(prod);
                              onClose();
                            }}
                          >
                            {prod.title}
                          </h4>
                          <span className="rec-price">
                            ₹{Number(prod.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-rec-add"
                          onClick={() => handleAddToCart(prod)}
                          title="Add to shopping bag"
                        >
                          <ShoppingBag size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="concierge-msg-row concierge">
              <div className="msg-avatar">
                <Bot size={16} />
              </div>
              <div className="msg-bubble typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="concierge-presets-row">
          {PRESET_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="preset-chip"
              onClick={() => handleSendMessage(prompt)}
            >
              <Sparkles size={12} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          className="concierge-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="concierge-input"
            placeholder="Ask about materials, gift recommendations, or specific categories..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="concierge-send-btn"
            disabled={!inputText.trim()}
            aria-label="Send query"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
