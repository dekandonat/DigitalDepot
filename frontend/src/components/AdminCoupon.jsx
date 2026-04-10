import './AdminCoupon.css';
import { useEffect, useState } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';

export default function AdminCoupon() {
  const [currentCode, setCurrentCode] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [toast, setToast] = useState('');

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const handleCodeChange = (e) => {
    setCurrentCode(e.target.value);
  };

  const handlePriceChange = (e) => {
    setCurrentPrice(e.target.value);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCouponAdd = () => {
    apiFetch('/adminRoute/coupon', {
      method: 'POST',
      body: {
        code: currentCode,
        price: currentPrice,
      },
    })
      .then((data) => {
        setCurrentCode('');
        setCurrentPrice('');
        if (data.result == 'success') {
          showToast('Sikeres hozzáadás');
        }
      })
      .catch((err) => {
        setModal({ isOpen: true, title: 'Hiba', message: err.message });
      });
  };

  return (
    <>
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={closeModal}
        type="alert"
      />
      {toast && <div className="toastMessage">{toast}</div>}
      <h2>Kupon kezelő</h2>
      <div class="adminAddCouponDiv">
        <form>
          <label htmlFor="code">Kód: </label>
          <input
            type="text"
            id="code"
            name="code"
            value={currentCode}
            onChange={handleCodeChange}
          ></input>
          <label htmlFor="price">Érték (Ft): </label>
          <input
            type="number"
            id="price"
            name="price"
            value={currentPrice}
            onChange={handlePriceChange}
          ></input>
          <button type="button" onClick={handleCouponAdd}>
            Létrehozás
          </button>
        </form>
      </div>
    </>
  );
}
