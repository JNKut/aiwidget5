#!/usr/bin/env node

import { writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Creating STATIC-ONLY build for Railway...');

try {
  // Clean build
  if (existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  
  mkdirSync('dist/public', { recursive: true });

  console.log('📄 Creating completely static HTML (no server dependencies)...');
  
  // Create completely static HTML that works without any backend
  const staticHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chat Widget</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: system-ui, -apple-system, sans-serif; 
            background: transparent;
        }
        .widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }
        .widget-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #4285f4;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.2s;
        }
        .widget-button:hover {
            transform: scale(1.05);
        }
        .chat-panel {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .chat-header {
            background: #4285f4;
            color: white;
            padding: 16px 20px;
            font-weight: 500;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f5f5f5;
        }
        .message {
            margin-bottom: 12px;
            padding: 10px 14px;
            border-radius: 18px;
            max-width: 85%;
            word-wrap: break-word;
        }
        .message.user {
            background: #4285f4;
            color: white;
            margin-left: auto;
            border-radius: 18px 18px 4px 18px;
        }
        .message.assistant {
            background: white;
            border: 1px solid #e0e0e0;
            color: #333;
            border-radius: 18px 18px 18px 4px;
        }
        .chat-input {
            border-top: 1px solid #e0e0e0;
            padding: 12px 16px;
            background: white;
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .chat-input input {
            flex: 1;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            padding: 10px 16px;
            outline: none;
            font-size: 14px;
            background: white;
        }
        .chat-input input:focus {
            border-color: #4285f4;
        }
        .send-button {
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 8px;
            width: 36px;
            height: 36px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
        .send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .welcome-message {
            padding: 10px 14px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 18px 18px 18px 4px;
            color: #333;
            margin-bottom: 12px;
            max-width: 85%;
        }
    </style>
</head>
<body>
    <div id="ai-widget"></div>
    
    <script>
        const { useState, useEffect } = React;
        
        function AIWidget() {
            const [isOpen, setIsOpen] = useState(false);
            const [messages, setMessages] = useState([]);
            const [inputValue, setInputValue] = useState('');
            
            return React.createElement('div', { className: 'widget-container' },
                React.createElement('button', {
                    className: 'widget-button',
                    onClick: () => setIsOpen(!isOpen),
                    title: 'Chat with AI Assistant'
                }, isOpen ? '✕' : '💬'),
                
                isOpen && React.createElement('div', { className: 'chat-panel' },
                    React.createElement('div', { className: 'chat-header' }, 
                        React.createElement('span', { style: { marginRight: '8px' } }, '🤖'),
                        'AI Assistant'
                    ),
                    
                    React.createElement('div', { className: 'chat-messages' },
                        messages.length === 0 ? 
                            React.createElement('div', { className: 'welcome-message' },
                                'Hi! I\\'m your AI assistant. How can I help you today?'
                            ) : 
                            messages.map((msg, idx) => 
                                React.createElement('div', {
                                    key: idx,
                                    className: \`message \${msg.role}\`
                                }, msg.content)
                            )
                    ),
                    
                    React.createElement('div', { className: 'chat-input' },
                        React.createElement('input', {
                            type: 'text',
                            placeholder: 'Type your message...',
                            value: inputValue,
                            onChange: (e) => setInputValue(e.target.value),
                            onKeyPress: (e) => {
                                if (e.key === 'Enter') {
                                    if (inputValue.trim()) {
                                        setMessages(prev => [...prev, 
                                            { role: 'user', content: inputValue },
                                            { role: 'assistant', content: 'I\\'m a demo widget. Connect me to your backend for full functionality!' }
                                        ]);
                                        setInputValue('');
                                    }
                                }
                            }
                        }),
                        React.createElement('button', {
                            className: 'send-button',
                            onClick: () => {
                                if (inputValue.trim()) {
                                    setMessages(prev => [...prev, 
                                        { role: 'user', content: inputValue },
                                        { role: 'assistant', content: 'I\\'m a demo widget. Connect me to your backend for full functionality!' }
                                    ]);
                                    setInputValue('');
                                }
                            },
                            title: 'Send message'
                        }, '✈️')
                    )
                )
            );
        }
        
        // Initialize widget
        const container = document.getElementById('ai-widget');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(AIWidget));
    </script>
</body>
</html>`;

  // Write static HTML
  writeFileSync('dist/public/index.html', staticHTML);
  
  // Create minimal server file for Railway
  const serverCode = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve widget for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Widget server running on port \${PORT}\`);
});
`;

  writeFileSync('dist/index.js', serverCode);
  
  console.log('✅ Static-only build completed!');
  console.log('📁 Files created:');
  console.log('  - dist/public/index.html (static widget)');
  console.log('  - dist/index.js (minimal server)');
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}