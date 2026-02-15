import { socket } from '../assets/util/socket';
import { useEffect, useState } from 'react';
import './ChatPanel.css';

export default function ChatPanel({ changeIsOpen }) {
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [myId, setMyId] = useState(null);

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
    socket.auth = {
      token: localStorage.getItem('token'),
    };
    socket.connect();
    socket.on('connect', () => {
      setMyId(socket.id);
      console.log(socket.id);
    });
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  return (
    <div className="mainChatDiv">
      <div className="chatHeader">
        <h4>Segítség kérés</h4>
        <button onClick={handleChatClose}>X</button>
      </div>
      <div className="chatBody">
        <div>
          {messages.length > 0 ? (
            messages.map((message) => {
              return (
                <p
                  className={
                    message.sender == myId ? 'sentMessage' : 'receivedMessage'
                  }
                >
                  {message.text}
                </p>
              );
            })
          ) : (
            <p>Itt fognak megjelenni az üzenetek!</p>
          )}
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
