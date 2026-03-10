import './AdminChatPanel.css';
import { useState, useEffect, useRef } from 'react';
import { socket } from '../assets/util/socket';
import { apiFetch } from '../assets/util/fetch';

export default function AdminChatPanel() {
  const [userMessages, setUserMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [openTopics, setOpenTopics] = useState({
    'Szállítás': true,
    'Fizetés': true,
    'Termékhiba': true,
    'Garancia': true,
    'Visszaküldés': true,
    'Rendelés': true,
    'Egyéb': true
  });
  
  const messagesEndRef = useRef(null);
  const currentUserRef = useRef(null);
  const predefinedTopics = [
    'Szállítás', 
    'Fizetés', 
    'Termékhiba', 
    'Garancia', 
    'Visszaküldés', 
    'Rendelés', 
    'Egyéb'
  ];

  const activeUser = currentUser ? userMessages.find(u => u.id === currentUser.id) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeUser, activeUser?.messages]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setUserMessages((prev) => {
        if (newMessage.recipientId) {
          const userId = newMessage.recipientId;
          return prev.map((u) =>
            u.id === userId
              ? { ...u, unread: false, messages: [...u.messages, newMessage] }
              : u
          );
        } else {
          const userExists = prev.find((u) => u.id === newMessage.sender);
          if (userExists) {
            return prev.map((u) =>
              u.id === newMessage.sender
                ? { ...u, unread: currentUserRef.current?.id !== newMessage.sender, messages: [...u.messages, newMessage] }
                : u
            );
          } else {
            fetchMessages();
            return prev;
          }
        }
      });
    };

    socket.auth = { token: localStorage.getItem('token') };
    socket.connect();
    socket.on('receive_message', handleNewMessage);
    fetchMessages();

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await apiFetch('/adminRoute/messages');
      if (data.result === 'success') {
        setUserMessages(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserClick = async (user) => {
    setCurrentUser(user);
    setIsSideBarOpen(false);
    if (user.unread) {
      try {
        await apiFetch(`/adminRoute/readmessages/${user.id}`, { method: 'PATCH' });
        setUserMessages((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, unread: false } : u))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMessageChange = (e) => {
    setTypedMessage(e.target.value);
  };

  const handleMessageSend = () => {
    if (typedMessage.trim() === '') return;
    const msgData = {
      text: typedMessage, 
      recipientId: currentUser.id,
    };
    socket.emit('send_message', msgData);
    setTypedMessage('');
  };

  const toggleTopic = (topic) => {
    setOpenTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  const getGroupedUsers = () => {
    const groups = {
      'Szállítás': [],
      'Fizetés': [],
      'Termékhiba': [],
      'Garancia': [],
      'Visszaküldés': [],
      'Rendelés': [],
      'Egyéb': []
    };
    userMessages.forEach(u => {
      const t = u.chatTopic && predefinedTopics.includes(u.chatTopic) ? u.chatTopic : 'Egyéb';
      groups[t].push(u);
    });
    return groups;
  };

  const groupedUsers = getGroupedUsers();

  return (
    <>
      <h1 className="adminChatPanelH1">Üzenetek Kezelése</h1>
      <button className="mobileMenuToggle" onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
        {isSideBarOpen ? 'Kategóriák Bezárása' : 'Kategóriák / Ügyfelek'}
      </button>
      
      <div className="adminChatPanelFlexbox">
        <div className={`adminChatList ${isSideBarOpen ? 'open' : ''}`}>
          {predefinedTopics.map(topic => (
            <div key={topic} className="topicAccordion">
              <div className="topicAccordionHeader" onClick={() => toggleTopic(topic)}>
                <span>{topic} ({groupedUsers[topic].length})</span>
                <span>{openTopics[topic] ? '▲' : '▼'}</span>
              </div>
              
              <div className={`topicAccordionBody ${openTopics[topic] ? 'open' : ''}`}>
                {groupedUsers[topic].length > 0 ? (
                  groupedUsers[topic].map((user) => (
                    <div
                      key={user.id}
                      className={`adminChatUser ${currentUser?.id === user.id ? 'active' : ''}`}
                      onClick={() => handleUserClick(user)}
                    >
                      <h3>
                        {user.userName || `Felhasználó #${user.id}`}
                        {user.unread && <span className="unreadBadge">Új</span>}
                      </h3>
                      <p>{user.messages[user.messages.length - 1]?.text || 'Nincs üzenet'}</p>
                    </div>
                  ))
                ) : (
                  <p className="adminEmptyTopic">
                    Nincs beszélgetés
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {activeUser ? (
          <div className="adminChatText">
            <div className="adminChatMessageField">
              {activeUser.messages.map((message, idx) => {
                const d = new Date(message.date || message.sentAt || Date.now());
                const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
                const isSent = message.recipientId != null;

                return (
                  <div key={idx} className={`adminMessageWrapper ${isSent ? 'sent' : 'received'}`}>
                    <div className={isSent ? 'sentMessageAdmin' : 'receivedMessageAdmin'}>
                      {message.text}
                    </div>
                    <span className="messageTimeAdmin">{timeStr}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="adminChatInput">
              <input
                type="text"
                value={typedMessage}
                onChange={handleMessageChange}
                onKeyDown={(e) => e.key === 'Enter' && handleMessageSend()}
                placeholder="Írj egy választ..."
              />
              <button onClick={handleMessageSend}>Küldés</button>
            </div>
          </div>
        ) : (
          <div className="adminNoChatSelected">
            <h2>Válassz ki egy beszélgetést!</h2>
          </div>
        )}
      </div>
    </>
  );
}