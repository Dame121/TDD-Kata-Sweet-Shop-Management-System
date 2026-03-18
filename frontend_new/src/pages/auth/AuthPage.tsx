import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import '@styles/Auth.css';

type MessageType = 'success' | 'error' | 'info' | '';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('');

  const showMessage = (text: string, type: MessageType = 'info'): void => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleAuthSuccess = (token: string, user: any): void => {
    showMessage(`Welcome, ${user.username}!`, 'success');
    setTimeout(() => {
      onAuthSuccess(token, user);
    }, 1500);
  };

  const switchTab = (tab: 'login' | 'signup'): void => {
    setActiveTab(tab);
    setMessage('');
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-header-content">
          <h1>
            <i className="bi bi-shop"></i> Sweet Shop Management
          </h1>
          <p>Welcome! Please login or create an account</p>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            <i className="bi bi-box-arrow-in-right"></i>Login
          </button>
          <button 
            className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            <i className="bi bi-person-plus"></i>Sign Up
          </button>
        </div>

        {message && (
          <div className={`auth-message ${messageType}`}>
            <div className="message-icon">
              {messageType === 'success' && <i className="bi bi-check-circle-fill"></i>}
              {messageType === 'error' && <i className="bi bi-exclamation-circle-fill"></i>}
              {messageType === 'info' && <i className="bi bi-info-circle-fill"></i>}
            </div>
            <span className="message-text">{message}</span>
            <button onClick={() => setMessage('')} className="message-close-btn">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        <div className="auth-card">
          {activeTab === 'login' ? (
            <Login 
              onSuccess={handleAuthSuccess}
              onError={() => {}}
              onMessage={showMessage}
            />
          ) : (
            <Signup 
              onSuccess={handleAuthSuccess}
              onError={() => {}}
              onMessage={showMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
