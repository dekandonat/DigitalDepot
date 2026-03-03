import { useState, useEffect } from 'react';
import './AdminInventory.css';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [id, setId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [toast, setToast] = useState('');

  function handleIdChange(event) {
    setId(event.target.value);
  }

  function handleQuantityChange(event) {
    setQuantity(event.target.value);
  }

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  useEffect(() => {
    getMethodFetch('/products')
      .then((data) => {
        setProducts(data.data);
      })
      .catch((err) => {
        setModal({ isOpen: true, title: 'Hiba', message: 'Nem sikerült betölteni a termékeket.' });
      });
  }, []);

  const getMethodFetch = (url) => {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  };

  const handleAddInventory = () => {
    if (!id || !quantity) {
        setModal({ isOpen: true, title: 'Figyelem', message: 'Kérjük, töltse ki mindkét mezőt!' });
        return;
    }

    apiFetch('/adminRoute/products/addInventory', {
      body: { id: parseInt(id), quantity: parseInt(quantity) },
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((data) => {
        showToast(data.result);
        setId('');
        setQuantity('');
        getMethodFetch('/products')
          .then((data) => {
            setProducts(data.data);
          })
          .catch((err) => {
            setModal({ isOpen: true, title: 'Hiba', message: 'Sikeres frissítés, de a lista frissítése sikertelen.' });
          });
      })
      .catch((err) => {
        setModal({ isOpen: true, title: 'Hiba', message: 'Hiba történt a készlet frissítésekor.' });
      });
  };

  return (
    <div className="inventoryContainer">
      <CustomModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={closeModal}
        type="alert"
      />
      {toast && <div className="toastMessage">{toast}</div>}

      <div className="inventoryHeader">
        <h2>Leltár Kezelése</h2>
      </div>

      <div className="inventoryCard">
        <div className="inventoryFormGrid">
          <div className="formGroup">
            <label htmlFor="azonosito">Termék azonosító (ID)</label>
            <input
              id="azonosito"
              value={id}
              type="number"
              placeholder="Pl. 101"
              onChange={handleIdChange}
            />
          </div>

          <div className="formGroup">
            <label htmlFor="mennyiseg">Hozzáadandó mennyiség</label>
            <input
              id="mennyiseg"
              value={quantity}
              type="number"
              placeholder="Pl. 50"
              onChange={handleQuantityChange}
            />
          </div>

          <button
            type="button"
            className="submitStockBtn"
            onClick={handleAddInventory}
          >
            Készlet frissítése
          </button>
        </div>
      </div>

      <div className="inventoryCard">
        <div className="tableWrapper">
          <table className="stockTable">
            <thead>
              <tr>
                <th>Azonosító</th>
                <th>Megnevezés</th>
                <th>Készleten</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                return (
                  <tr key={product.prodId}>
                    <td className="idCell">#{product.prodId}</td>
                    <td>{product.productName}</td>
                    <td className="qtyCell">{product.quantity} db</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}