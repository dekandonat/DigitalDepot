import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import './AdminUsersList.css';

export default function AdminUsersList() {
    const [users, setUsers] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', userId: null, newRole: '', message: '' });
    const [toast, setToast] = useState({ message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast({ message: '', type: '' });
        }, 3000);
    };

    const fetchUsers = async () => {
        try {
            const data = await apiFetch('/adminRoute/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (data.result === 'success') {
                setUsers(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const initiateDelete = (userId) => {
        setConfirmDialog({
            isOpen: true,
            type: 'delete',
            userId: userId,
            newRole: '',
            message: 'Biztosan törölni szeretnéd ezt a felhasználót?'
        });
    };

    const initiateRoleChange = (userId, newRole) => {
        setConfirmDialog({
            isOpen: true,
            type: 'role',
            userId: userId,
            newRole: newRole,
            message: `Biztosan módosítod a szerepkört erre: ${newRole}?`
        });
    };

    const handleConfirm = async () => {
        const { type, userId, newRole } = confirmDialog;
        setConfirmDialog({ isOpen: false, type: '', userId: null, newRole: '', message: '' });

        if (type === 'delete') {
            try {
                const data = await apiFetch(`/adminRoute/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                
                if (data.result === 'success') {
                    showToast('Felhasználó sikeresen törölve!', 'success');
                    fetchUsers();
                } else {
                    showToast('Hiba a törlés során!', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Szerver hiba történt!', 'error');
            }
        } else if (type === 'role') {
            try {
                const data = await apiFetch(`/adminRoute/users/${userId}/role`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: { role: newRole }
                });
                
                if (data.result === 'success') {
                    showToast('Szerepkör sikeresen frissítve!', 'success');
                    fetchUsers();
                } else {
                    showToast('Hiba a jogosultság módosításakor!', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Szerver hiba történt!', 'error');
            }
        }
    };

    const handleCancel = () => {
        setConfirmDialog({ isOpen: false, type: '', userId: null, newRole: '', message: '' });
        fetchUsers();
    };

    return (
        <div className="adminUsersContainer">
            {toast.message && (
                <div className={`toastMessage toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {confirmDialog.isOpen && (
                <div className="confirmModalOverlay">
                    <div className="confirmModalContent">
                        <h3>{confirmDialog.message}</h3>
                        <div className="confirmModalButtons">
                            <button className="confirmYesBtn" onClick={handleConfirm}>Igen</button>
                            <button className="confirmNoBtn" onClick={handleCancel}>Mégse</button>
                        </div>
                    </div>
                </div>
            )}

            <h2>Felhasználók kezelése</h2>
            
            <div className="usersTableWrapper">
                <table className="usersTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Név</th>
                            <th>Email</th>
                            <th>Szerepkör</th>
                            <th>Műveletek</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.userId}>
                                <td data-label="ID">#{user.userId}</td>
                                <td data-label="Név">{user.userName}</td>
                                <td data-label="Email">{user.email}</td>
                                <td data-label="Szerepkör">
                                    <select 
                                        className="roleSelect"
                                        value={user.role} 
                                        onChange={(e) => initiateRoleChange(user.userId, e.target.value)}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="owner">Owner</option>
                                    </select>
                                </td>
                                <td data-label="Műveletek">
                                    {user.role !== 'owner' && (
                                        <button 
                                            className="deleteUserBtn"
                                            onClick={() => initiateDelete(user.userId)}
                                        >
                                            Törlés
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}