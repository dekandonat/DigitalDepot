import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('utanvet');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [currentCoupon, setCurrentCoupon] = useState('');
  const [currentCouponState, setCurrentCouponState] = useState(null);
  const [currentDiscount, setCurrentDiscount] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    redirect: null,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await apiFetch('/user/addresses');
          if (data.result === 'success') {
            setSavedAddresses(data.data);
            if (data.data.length > 0) {
              setSelectedAddressId(data.data[0].id.toString());
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchAddresses();
  }, []);

  useEffect(() => {
    apiFetch('/cart')
      .then((data) => {
        setCurrentPrice(data.data.total[0].total);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  const closeModal = () => {
    const redirectPath = modal.redirect;
    setModal({ isOpen: false, title: '', message: '', redirect: null });
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const token = localStorage.getItem('token');

    if (!token) {
      setModal({
        isOpen: true,
        title: 'Figyelem',
        message: 'Jelentkezz be a vásárláshoz!',
        redirect: '/',
      });
      return;
    }

    const name = form.name.value.trim();
    let shippingAddress = '';

    if (selectedAddressId === 'new') {
      const zip = form.zip.value.trim();
      const city = form.city.value.trim();
      const address = form.address.value.trim();
      shippingAddress = `${zip} ${city}, ${address}`;
    } else {
      const selected = savedAddresses.find(
        (a) => a.id.toString() === selectedAddressId
      );
      if (selected) {
        shippingAddress = `${selected.zipCode} ${selected.city}, ${selected.streetAddress}`;
      }
    }

    const couponCode = form.couponCode?.value.trim() || '';

    try {
      const data = await apiFetch('/order/place-order', {
        method: 'POST',
        body: { shippingAddress, paymentMethod, couponCode },
      });

      if (data.result === 'success') {
        setModal({
          isOpen: true,
          title: 'Sikeres rendelés!',
          message: 'Köszönjük a vásárlást! A rendelésedet rögzítettük.',
          redirect: '/my-orders',
        });
      } else {
        setModal({
          isOpen: true,
          title: 'Hiba',
          message: data.message || 'Hiba történt a rendelés során.',
          redirect: null,
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: 'Hiba',
        message: 'Nem sikerült csatlakozni a szerverhez.',
        redirect: null,
      });
    }
  };

  const handleCouponChange = (e) => {
    setCurrentCouponState(null);
    setCurrentDiscount(null);
    setCurrentCoupon(e.target.value);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCouponCheck = () => {
    if (!currentCoupon) {
      return;
    }

    apiFetch('/coupon/check', {
      method: 'POST',
      body: {
        code: currentCoupon,
      },
    })
      .then((data) => {
        if (data.result == 'success') {
          showToast('Sikeres kupon ellenőrzés');
          setCurrentCouponState('success');
          setCurrentDiscount(data.data.value);
        }
      })
      .catch((err) => {
        setCurrentCouponState('fail');
      });
  };

  return (
    <div className="checkoutContainer">
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={closeModal}
      />
      {toast && <div className="toastMessage">{toast}</div>}
      <h2>Pénztár</h2>
      <form className="checkoutForm" onSubmit={handleSubmit}>
        <h3>Számlázási és Szállítási adatok</h3>
        <input type="text" name="name" placeholder="Teljes név" required />

        {savedAddresses.length > 0 && (
          <div className="addressSelectionGroup">
            <label className="addressSelectionLabel">
              Válassz szállítási címet:
            </label>
            <select
              className="paymentSelect"
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              {savedAddresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.zipCode} {addr.city}, {addr.streetAddress}
                </option>
              ))}
              <option value="new">+ Új cím megadása</option>
            </select>
          </div>
        )}

        {selectedAddressId === 'new' && (
          <>
            <div className="inputRow">
              <input
                type="text"
                name="zip"
                placeholder="Irányítószám"
                required
              />
              <input type="text" name="city" placeholder="Település" required />
            </div>
            <input
              type="text"
              name="address"
              placeholder="Utca, házszám"
              required
            />
          </>
        )}

        <div className="couponSection">
          <h3 className="couponSectionTitle">Kupon:</h3>
          <div className="couponInputContainer">
            <input
              type="text"
              name="couponCode"
              className={`couponInput ${currentCouponState}`}
              placeholder="Írd be a kuponkódot"
              value={currentCoupon}
              onChange={handleCouponChange}
              disabled={currentCouponState === 'success'}
            />
            <button
              type="button"
              className="payButton couponButton"
              onClick={
                currentCouponState != 'success' ? handleCouponCheck : null
              }
            >
              Beváltás
            </button>
          </div>
          {currentDiscount ? <h4>Kedvezmény: {currentDiscount} Ft</h4> : null}
        </div>

        <h3>Fizetési mód</h3>
        <div className="paymentMethodContainer">
          <select
            name="paymentMethod"
            className="paymentSelect"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="utanvet">Utánvét (Fizetés a futárnál)</option>
            <option value="card" disabled>
              Bankkártyás fizetés
            </option>
          </select>
          <p className="unavailableMessage">
            Sajnáljuk, a bankkártyás fizetés jelenleg nem elérhető.
          </p>
        </div>
        <h3>
          Végösszeg: {currentPrice ? currentPrice - currentDiscount : 0} Ft
        </h3>
        <button type="submit" className="payButton">
          Rendelés leadása (Utánvét)
        </button>
      </form>
    </div>
  );
}
