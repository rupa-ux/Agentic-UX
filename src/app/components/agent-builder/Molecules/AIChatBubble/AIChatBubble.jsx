import React from 'react';
import './AIChatBubble.css';

function AiAvatarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#1976D2"/>
      <path d="M10 5L11.5 8.5L15 10L11.5 11.5L10 15L8.5 11.5L5 10L8.5 8.5L10 5Z" fill="white"/>
    </svg>
  );
}

export default function AIChatBubble({ message, options = [], onOptionSelect }) {
  return (
    <div className="ai-chat-bubble">
      <div className="ai-chat-bubble__avatar">
        <AiAvatarIcon />
      </div>
      <div className="ai-chat-bubble__body">
        <p className="ai-chat-bubble__message">{message}</p>
        {options.length > 0 && (
          <div className="ai-chat-bubble__options">
            {options.map((opt, i) => (
              <button
                key={i}
                className="ai-chat-bubble__option"
                onClick={() => onOptionSelect?.(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
