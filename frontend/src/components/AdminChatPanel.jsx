import './AdminChatPanel.css';
import { useState, useEffect } from 'react';
import { socket } from '../assets/util/socket';

export default function AdminChatPanel() {
  const [userMessages, setUserMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);

  useEffect(() => {
    socket.auth = {
      token: localStorage.getItem('token'),
    };
    socket.connect();
  }, []);

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
        <div className="adminChatText"></div>
      </div>
    </>
  );
}
