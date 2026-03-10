import { socket } from '../assets/util/socket';
import { useEffect, useState, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import './ChatPanel.css';
import { apiFetch } from '../assets/util/fetch';

export default function ChatPanel({ changeIsOpen }) {
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [myId, setMyId] = useState(null);
  const [topicSelected, setTopicSelected] = useState(false);
  const messageEndRef = useRef(null);

  const predefinedTopics = [
    'Szállítás', 
    'Fizetés', 
    'Termékhiba', 
    'Garancia', 
    'Visszaküldés', 
    'Rendelés'
  ];

  const handleChatClose = () => {
    changeIsOpen((prev) => !prev);
  };

  const handleInputChange = (event) => {
    setTypedMessage(event.target.value);
  };

  const sendMessage = () => {
    if (typedMessage.trim() === '') return;
    socket.emit('send_message', typedMessage);
    setTypedMessage('');
  };

  const handleTopicSelect = async (topic) => {
    try {
      await apiFetch('/user/chat-topic', {
        method: 'PATCH',
        body: { topic: topic }
      });
      setTopicSelected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, topicSelected]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    apiFetch('/user/messages', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    })
      .then((data) => {
        const msgs = data.data[0]?.messages || [];
        setMessages(msgs);
        if (msgs.length > 0) {
          setTopicSelected(true);
        }
      })
      .catch(() => {
        console.error('Hiba a kérés során');
      });

    const decodedToken = jwtDecode(localStorage.getItem('token'));
    setMyId(decodedToken.id);

    socket.auth = {
      token: localStorage.getItem('token'),
    };
    socket.connect();
    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, []);

  return (
    <div className="mainChatDiv">
      <div className="chatHeader">
        <h4>Segítség kérés</h4>
        <button onClick={handleChatClose}>X</button>
      </div>
      
      <div className="chatBody">
        <div className="chatMessages">
          {!topicSelected ? (
            <div className="topicSelectorFull">
              <h3>Miben segíthetünk?</h3>
              <div className="topicGrid">
                {predefinedTopics.map((topic) => (
                  <button
                    key={topic}
                    className="topicFullBtn"
                    onClick={() => handleTopicSelect(topic)}
                  >
                    {topic}
                  </button>
                ))}
                <button
                  className="topicFullBtn otherBtn"
                  onClick={() => handleTopicSelect('Egyéb')}
                >
                  Egyéb
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const text = message.message || message.text || '';
                  const d = new Date(message.date || message.sentAt || Date.now());
                  const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
                  const isSent = message.sender == myId;

                  return (
                    <div key={index} className={`messageWrapper ${isSent ? 'sent' : 'received'}`}>
                      <div className={isSent ? 'sentMessage' : 'receivedMessage'}>
                        {text}
                      </div>
                      <span className="messageTime">{timeStr}</span>
                    </div>
                  );
                })
              ) : (
                <p className="chatEmptyState">
                  Kezdd el a beszélgetést!
                </p>
              )}
            </>
          )}
          <div ref={messageEndRef} />
        </div>

        <div className="chatInputArea">
          <input
            type="text"
            value={typedMessage}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && topicSelected && sendMessage()}
            placeholder={topicSelected ? "Írj egy üzenetet..." : "Kérlek válassz a fenti témákból..."}
            disabled={!topicSelected}
          />
          <button onClick={sendMessage} disabled={!topicSelected}>Küldés</button>
        </div>
      </div>
    </div>
  );
}