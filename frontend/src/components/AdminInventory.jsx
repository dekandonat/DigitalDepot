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
      .then((res) => res.json())
      .catch((err) => {
        throw err;
      });
  };

  const handleAddInventory = async () => {
    if (!id || !quantity) {
      setModal({ isOpen: true, title: 'Hiba', message: 'Kérem adja meg a termék azonosítót és a mennyiséget!' });
      return;
    }

    try {
      const data = await apiFetch('/adminRoute/products/addInventory', {
        method: 'PATCH',
        body: { id: parseInt(id), quantity: parseInt(quantity) },
      });

      if (data.result === 'success') {
        showToast('Készlet sikeresen frissítve!');
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product.prodId === parseInt(id)
              ? { ...product, quantity: product.quantity + parseInt(quantity) }
              : product
          )
        );
        setId('');
        setQuantity('');
      } else {
        setModal({ isOpen: true, title: 'Hiba', message: data.message || 'Hiba történt a frissítés során.' });
      }
    } catch (err) {
      setModal({ isOpen: true, title: 'Hiba', message: 'Szerver hiba történt.' });
    }
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
        <h2>Leltár kezelése</h2>
        <p>Termékek készletének gyors frissítése</p>
      </div>

      <div className="inventoryCard">
        <div className="inventoryFormGrid">
          <div className="formGroup">
            <label htmlFor="azonosito">Termék Azonosító (ID)</label>
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

          <div className="formGroup">
            <label style={{ visibility: 'hidden' }}>Rejtett</label>
            <button
              type="button"
              className="submitStockBtn"
              onClick={handleAddInventory}
            >
              Készlet frissítése
            </button>
          </div>
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