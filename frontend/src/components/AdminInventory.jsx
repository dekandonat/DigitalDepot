import { useState, useEffect } from 'react';
import './AdminInventory.css';
import { apiFetch } from '../assets/util/fetch';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [id, setId] = useState('');
  const [quantity, setQuantity] = useState('');

  function handleIdChange(event) {
    setId(event.target.value);
  }

  function handleQuantityChange(event) {
    setQuantity(event.target.value);
  }

  useEffect(() => {
    getMethodFetch('/products')
      .then((data) => {
        setProducts(data.data);
      })
      .catch((err) => {
        console.error(err);
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
    if (!id || !quantity) return;

    apiFetch('/adminRoute/products/addInventory', {
      body: { id: parseInt(id), quantity: parseInt(quantity) },
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((data) => {
        alert(data.result);
        setId('');
        setQuantity('');
        getMethodFetch('/products')
          .then((data) => {
            setProducts(data.data);
          })
          .catch((err) => {
            console.error(err.message);
          });
      })
      .catch((err) => {
        console.error('Error: ' + err.message);
        alert('Hiba történt');
      });
  };

  return (
    <div className="inventoryContainer">
      <div className="inventoryHeader">
        <h2>Leltár Kezelése</h2>
        <p>Termékek készletmennyiségének manuális frissítése</p>
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