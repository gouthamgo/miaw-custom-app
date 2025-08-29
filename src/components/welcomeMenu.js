import React from 'react';
import './welcomeMenu.css';
import { VscSend } from "react-icons/vsc";
import { FaArrowRight } from "react-icons/fa";

// This component displays the initial menu.
// The `onStartConversation` prop is a function that will be called when the user decides to chat.
export default function WelcomeMenu({ onStartConversation }) {
  // This function will be called when a user clicks a quick question or the "Chat with the team" button.
  const handleStart = () => {
    // We pass a message to indicate a new conversation should start.
    // You could also pass specific values for each button if you want your bot to react differently.
    onStartConversation("Hello");
  };

  return (
    <div className="welcomeMenuContainer">
      <div className="welcomeHeader">
        <h2>Taking Shape</h2>
        <h1>Live chat with our team 💙</h1>
      </div>
      
      <div className="welcomeOptions">
        {/* Quick Questions */}
        <div className="card questionsCard">
          <button className="optionButton" onClick={handleStart}>
            <span>How do I find the perfect fit?</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button className="optionButton" onClick={handleStart}>
            <span>Where can I get a discount?</span>
            <span className="arrow">{'>'}</span>
          </button>
          <button className="optionButton" onClick={handleStart}>
            <span>How do I arrange a return?</span>
            <span className="arrow">{'>'}</span>
          </button>
        </div>

        {/* Track Orders */}
        <div className="card">
           <button className="optionButton" onClick={handleStart}>
            <span>📦</span>
            <span className="optionText">Track and manage my orders</span>
            <span className="arrow">{'>'}</span>
          </button>
        </div>
        
        {/* Start Chat */}
        <div className="card chatCard" onClick={handleStart}>
          <div className="chatInfo">
            <div className="chatIcon">TS</div>
            <div className="chatText">
              <strong>Taking Shape </strong>
              <span>Chat with the team</span>
            </div>
          </div>
          <VscSend className="sendIcon" />
        </div>

         {/* Previous Conversation Link */}
        <div className="previousConversationLink">
            Go to previous conversation <FaArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}