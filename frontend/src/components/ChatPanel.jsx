import { socket } from '../assets/util/socket';
import { useEffect, useState, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import './ChatPanel.css';
import { apiFetch } from '../assets/util/fetch';

export default function ChatPanel({ changeIsOpen }) {
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [myId, setMyId] = useState(null);
  const messageEndRef = useRef(null);

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

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    apiFetch('/user/messages', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    })
      .then((data) => {
        setMessages(data.data);
      })
      .catch((err) => {
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
          {messages.length > 0 ? (
            messages.map((message) => {
              return (
                <p
                  className={
                    message.sender == myId ? 'sentMessage' : 'receivedMessage'
                  }
                >
                  {message.message ? message.message : message.text}
                </p>
              );
            })
          ) : (
            <p>Itt fognak megjelenni az üzenetek!</p>
          )}
          <div ref={messageEndRef} />
        </div>
        <div className="chatInputArea">
          <input
            type="text"
            value={typedMessage}
            onChange={handleInputChange}
          ></input>
          <button onClick={sendMessage}>Küldés</button>
        </div>
      </div>
    </div>
  );
}
