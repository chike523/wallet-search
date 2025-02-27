// ChatWidget.jsx
import { useEffect } from 'react';

const ChatWidget = () => {
  useEffect(() => {
    // Initialize Chaport with queue
    window.chaportConfig = {
      appId: '6798f77c73a4ef82623f009a'
    };

    const initChat = () => {
      const v3 = window.chaport = {};
      v3._q = [];
      v3._l = {};
      v3.q = function() { v3._q.push(arguments) };
      v3.on = function(e, fn) {
        if (!v3._l[e]) v3._l[e] = [];
        v3._l[e].push(fn);
      };
    };

    if (!window.chaport) {
      initChat();
      
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://app.chaport.com/javascripts/insert.js';
      document.body.appendChild(s);

      // Expose a global function to open chat
      window.openChaport = () => {
        if (window.chaport && window.chaport.q) {
          window.chaport.q('open');
        }
      };
    }
  }, []);

  return null;
};

export default ChatWidget;