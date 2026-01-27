import { useState, useEffect } from 'react';
import './AdminInventory.css';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [id, setId] = useState(0);
  const [quantity, setQuantity] = useState(0);

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

  const patchMethodFetch = (url, body) => {
    return fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
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

  return (
    <div>
      <h1>Leltár</h1>
      <div className="adminInventoryDiv">
        <div>
          <label htmlFor="azonosito">Azonosító</label>
          <input
            id="azonosito"
            value={id}
            type="number"
            onChange={handleIdChange}
          ></input>

          <label htmlFor="mennyiseg">Mennyiség</label>
          <input
            id="mennyiseg"
            value={quantity}
            type="number"
            onChange={handleQuantityChange}
          ></input>

          <button
            type="button"
            onClick={() => {
              patchMethodFetch('/products/addInventory', {
                id: parseInt(id),
                quantity: parseInt(quantity),
              })
                .then((data) => {
                  alert(data.result);
                  setId(0);
                  setQuantity(0);
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
            }}
          >
            Hozzáadás
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Azonosító</th>
              <th>Megnevezés</th>
              <th>Darabszám</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              return (
                <tr key={product.prodId}>
                  <td>{product.prodId}</td>
                  <td>{product.productName}</td>
                  <td>{product.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
