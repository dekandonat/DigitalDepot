import './AdminChatPanel.css';
import { useState, useEffect } from 'react';
import { socket } from '../assets/util/socket';
import { apiFetch } from '../assets/util/fetch';

export default function AdminChatPanel() {
  const [userMessages, setUserMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [typedMessage, setTypedMessage] = useState('');

  useEffect(() => {
    apiFetch('/adminRoute/messages', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    })
      .then((data) => {
        console.log(data.data);
        setUserMessages(data.data);
      })
      .catch((err) => {
        console.error('Hiba az üzenetek lekérése során: ' + err.message);
      });

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

    return () => {
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      let currentUsersMessages = userMessages.find(
        (message) => message.id == currentUser.id
      );
      setCurrentUser(currentUsersMessages);
    }
  }, [userMessages]);

  const handleMessageChange = (event) => {
    setTypedMessage(event.target.value);
  };

  const handleUserChange = (id) => {
    let currentUsersMessages = userMessages.find((message) => message.id == id);
    setCurrentUser(currentUsersMessages);
  };

  const handleMessageSend = () => {
    if (typedMessage.trim() === '') return;
    socket.emit('send_message', {
      text: typedMessage,
      recipientId: currentUser.id,
    });
    setTypedMessage('');
  };

  return (
    <>
      <div className="adminChatPanelFlexbox">
        <div className="adminChatList">
          {userMessages.length > 0 ? (
            userMessages.map((user) => {
              return (
                <div
                  key={user.id}
                  className={`adminChatUser ${currentUser?.id == user.id ? 'active' : null}`}
                  onClick={() => {
                    handleUserChange(user.id);
                  }}
                >
                  <h3>#{user.id} Felhasználó</h3>
                  <p>{user.messages[user.messages.length - 1].text}</p>
                </div>
              );
            })
          ) : (
            <h4>Itt fognak megjelenni az üzenetek</h4>
          )}
        </div>
        {currentUser ? (
          <div className="adminChatText">
            <div className="adminChatMessageField">
              {currentUser?.messages?.map((message) => {
                return (
                  <h3
                    className={
                      message.recipientId
                        ? 'sentMessageAdmin'
                        : 'receivedMessageAdmin'
                    }
                  >
                    {message.text}
                  </h3>
                );
              })}
            </div>
            <div className="adminChatInput">
              <input
                type="text"
                value={typedMessage}
                onChange={handleMessageChange}
              ></input>
              <button onClick={handleMessageSend}>Küldés</button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
