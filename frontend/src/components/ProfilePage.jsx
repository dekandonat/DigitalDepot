import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';
import './ProfilePage.css';

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    bankAccount: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankInput, setBankInput] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [newAddress, setNewAddress] = useState({
    zipCode: '',
    city: '',
    streetAddress: '',
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    onConfirm: null,
  });

  useEffect(() => {
    fetchProfileData();
    fetchAddresses();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await apiFetch('/user/profile');
      if (data.result === 'success') {
        setUserData({
          name: data.data.userName,
          email: data.data.email,
          bankAccount: data.data.bankAccountNumber || '',
        });
        setBankInput(data.data.bankAccountNumber || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const data = await apiFetch('/user/addresses');
      if (data.result === 'success') {
        setAddresses(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBankSave = async () => {
    try {
      await apiFetch('/user/bank-account', {
        method: 'PATCH',
        body: { bankAccountNumber: bankInput },
      });
      setUserData((prev) => ({ ...prev, bankAccount: bankInput }));
      setIsEditingBank(false);
      setModal({
        isOpen: true,
        title: 'Siker',
        message: 'Bankszámlaszám sikeresen frissítve!',
        type: 'alert',
        onConfirm: () => setModal({ isOpen: false }),
      });
    } catch (err) {
      setModal({ isOpen: true, title: 'Hiba', message: err.message });
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/user/addresses', {
        method: 'POST',
        body: newAddress,
      });
      setShowAddressForm(false);
      setNewAddress({ zipCode: '', city: '', streetAddress: '' });
      fetchAddresses();
      setModal({
        isOpen: true,
        title: 'Siker',
        message: 'Új cím sikeresen mentve!',
        type: 'alert',
        onConfirm: () => setModal({ isOpen: false }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const initiateDeleteAddress = (id) => {
    setModal({
      isOpen: true,
      title: 'Törlés megerősítése',
      message: 'Biztosan törölni szeretnéd ezt a címet?',
      type: 'confirm',
      onConfirm: () => deleteAddress(id),
    });
  };

  const deleteAddress = async (id) => {
    try {
      await apiFetch(`/user/addresses/${id}`, { method: 'DELETE' });
      fetchAddresses();
      setModal({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: null,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profilePageContainer">
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />

      <h2 className="profilePageHeader">Profil Adatok</h2>

      <div className="profileCard">
        <h3>Személyes adatok</h3>
        <div className="profileDataRow">
          <span className="profileDataLabel">Név:</span>
          <span className="profileDataValue">{userData.name}</span>
        </div>
        <div className="profileDataRow">
          <span className="profileDataLabel">E-mail cím:</span>
          <span className="profileDataValue">{userData.email}</span>
        </div>
        <div className="profileDataRow">
          <span className="profileDataLabel">Bankszámlaszám:</span>
          {isEditingBank ? (
            <div className="bankInputGroup">
              <input
                type="text"
                value={bankInput}
                onChange={(e) => setBankInput(e.target.value)}
                placeholder="HU00 0000..."
                className="bankInput"
              />
              <button className="saveBankBtn" onClick={handleBankSave}>
                Mentés
              </button>
              <button
                className="editBankBtn"
                onClick={() => setIsEditingBank(false)}
              >
                ❌
              </button>
            </div>
          ) : (
            <div className="bankInputGroup">
              <span className="profileDataValue">
                {userData.bankAccount || 'Nincs megadva'}
              </span>
              <button
                className="editBankBtn"
                onClick={() => setIsEditingBank(true)}
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profileCard">
        <h3>Szállítási címek ({addresses.length})</h3>
        <div className="addressList">
          {addresses.length === 0 ? (
            <p className="emptyAddressText">
              Még nincs mentett szállítási címed.
            </p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="addressItem">
                <div className="addressDetails">
                  <p>
                    <strong>
                      {addr.zipCode} {addr.city}
                    </strong>
                  </p>
                  <p>{addr.streetAddress}</p>
                </div>
                <button
                  className="deleteAddressBtn"
                  onClick={() => initiateDeleteAddress(addr.id)}
                >
                  Törlés
                </button>
              </div>
            ))
          )}
        </div>

        {!showAddressForm ? (
          <button
            className="showAddressFormBtn"
            onClick={() => setShowAddressForm(true)}
          >
            + Új cím hozzáadása
          </button>
        ) : (
          <form className="addAddressForm" onSubmit={handleAddAddress}>
            <h4>Új cím megadása</h4>
            <input
              className="addressInput"
              type="text"
              placeholder="Irányítószám"
              value={newAddress.zipCode}
              onChange={(e) =>
                setNewAddress({ ...newAddress, zipCode: e.target.value })
              }
              required
            />
            <input
              className="addressInput"
              type="text"
              placeholder="Város"
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress({ ...newAddress, city: e.target.value })
              }
              required
            />
            <input
              className="addressInput"
              type="text"
              placeholder="Utca, házszám"
              value={newAddress.streetAddress}
              onChange={(e) =>
                setNewAddress({ ...newAddress, streetAddress: e.target.value })
              }
              required
            />
            <div className="addressFormButtons">
              <button type="submit" className="addAddressSubmitBtn">
                Mentés
              </button>
              <button
                type="button"
                className="addAddressCancelBtn"
                onClick={() => setShowAddressForm(false)}
              >
                Mégse
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
