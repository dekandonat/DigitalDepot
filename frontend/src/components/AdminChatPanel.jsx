import './AdminChatPanel.css';
import { useState, useEffect, useRef } from 'react';
import { socket } from '../assets/util/socket';
import { apiFetch } from '../assets/util/fetch';

export default function AdminChatPanel() {
  const [userMessages, setUserMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const currentUserRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentUser]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setUserMessages((prev) => {
        const currentUserId = currentUserRef.current?.id;
        if (newMessage.recipientId) {
          //Admin üzenet -> van recipientId benne
          const userId = newMessage.recipientId;
          return prev.map((u) =>
            u.id === userId
              ? { ...u, unread: false, messages: [...u.messages, newMessage] }
              : u
          );
        } else {
          //User üzenet
          const userExists = prev.find((u) => u.id === newMessage.sender);

          if (userExists) {
            return prev.map((u) =>
              u.id === newMessage.sender
                ? {
                    ...u,
                    unread: newMessage.sender == currentUserId ? false : true,
                    messages: [...u.messages, newMessage],
                  }
                : u
            );
          } else {
            return [
              ...prev,
              {
                id: newMessage.sender,
                unread: newMessage.sender == currentUserId ? false : true,
                messages: [newMessage],
              },
            ];
          }
        }
      });
    };

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
    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.disconnect();
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
    const selectedUser = userMessages.find((u) => u.id == id);
    setIsSideBarOpen(false);
    apiFetch(`/adminRoute/readmessages/${id}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
    })
      .then((data) => {
        console.log(data);
        if (selectedUser) {
          setUserMessages((prev) => {
            return prev.map((u) => (u.id === id ? { ...u, unread: false } : u));
          });
          setCurrentUser({ ...selectedUser, unread: false });
        }
      })
      .catch((err) => {
        console.error('Hiba az üzenetek frissítése során: ' + err.message);
      });
  };

  const handleMessageSend = () => {
    if (typedMessage.trim() === '') return;
    socket.emit('send_message', {
      text: typedMessage,
      recipientId: currentUser.id,
    });
    setTypedMessage('');
  };

  const handleDeleteChat = (id) => {
    apiFetch(`/adminRoute/messages/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })
      .then((data) => {
        if (data.result == 'success') {
          setUserMessages((prev) => prev.filter((user) => user.id !== id));

          if (currentUser?.id == id) {
            setCurrentUser(null);
          }
        }
      })
      .catch((err) => {
        console.error('Hiba: ' + err.message);
      });
  };

  return (
    <>
      <button
        className="mobileMenuToggle"
        onClick={() => setIsSideBarOpen((prev) => !prev)}
      >
        {isSideBarOpen ? '✖ Üzenetek' : '☰ Felhasználók'}
      </button>
      <div
        className={`adminChatPanelFlexbox ${isSideBarOpen ? 'open' : 'closed'}`}
      >
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
                  <button
                    className="deleteChatBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(user.id);
                    }}
                  >
                    ×
                  </button>
                  <h3>
                    #{user.id} Felhasználó{' '}
                    {user.unread ? (
                      <span className="unreadBadge">Új</span>
                    ) : null}
                  </h3>
                  <p>
                    {user.messages[user.messages.length - 1]?.text ||
                      'Nincsen üzenet'}
                  </p>
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
              <div ref={messagesEndRef} />
            </div>
            <div className="adminChatInput">
              <input
                type="text"
                value={typedMessage}
                onChange={handleMessageChange}
                onKeyDown={(e) => e.key === 'Enter' && handleMessageSend()}
              ></input>
              <button onClick={handleMessageSend}>Küldés</button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
