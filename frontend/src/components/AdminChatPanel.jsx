import './AdminChatPanel.css';
import { useState, useEffect } from 'react';
import { socket } from '../assets/util/socket';

export default function AdminChatPanel() {
  const [userMessages, setUserMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');

  useEffect(() => {
    socket.auth = {
      token: localStorage.getItem('token'),
    };
    socket.connect();
    socket.on('receive_message', (newMessage) => {
      setUserMessages((prev) => {
        if (newMessage.recipientId) {
          //Admin üzenet -> van recipientId benne
          const userId = newMessage.recipientId;
          return prev.map((u) =>
            u.id === userId
              ? { ...u, messages: [...u.messages, newMessage] }
              : u
          );
        } else {
          //User üzenet
          const userExists = prev.find((u) => u.id === newMessage.sender);

          if (userExists) {
            return prev.map((u) =>
              u.id === newMessage.sender
                ? { ...u, messages: [...u.messages, newMessage] }
                : u
            );
          } else {
            return [...prev, { id: newMessage.sender, messages: [newMessage] }];
          }
        }
      });
    });
  }, []);

  const handleMessageChange = (event) => {
    setTypedMessage(event.target.value);
  };

  return (
    <>
      <h1 className="adminChatPanelH1">Chat panel</h1>
      <div className="adminChatPanelFlexbox">
        <div className="adminChatList">
          {userMessages.length > 0 ? (
            <h4>Van user</h4>
          ) : (
            <h4>Itt fognak megjelenni az üzenetek</h4>
          )}
        </div>
        <div className="adminChatText">
          <div></div>
          <div>
            <input
              type="text"
              value={typedMessage}
              onChange={handleMessageChange}
            ></input>
            <button>Küldés</button>
          </div>
        </div>
      </div>
    </>
  );
}
