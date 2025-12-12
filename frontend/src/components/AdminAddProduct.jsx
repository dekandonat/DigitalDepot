import './AdminAddProduct.css';
import { useState, useEffect } from 'react';

export default function AdminAddProduct() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getMethodFetch = (url) => {
      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.message);
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

    getMethodFetch('/category')
      .then((data) => {
        setCategories(data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const postMethodFetch = (url, body) => {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.message);
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
    <div className="addProductDiv">
      <h1>Új termék hozzáadása</h1>
      <form id="addProductForm">
        <label htmlFor="nameId">Termék neve</label>
        <input type="text" id="nameId"></input>
        <label htmlFor="descriptionId">Termék leírása</label>
        <input type="text" id="descriptionId"></input>
        <label htmlFor="imgId">Termék képe</label>
        <input type="text" id="imgId"></input>
        <label htmlFor="priceId">Termék ára (HUF)</label>
        <input type="number" id="priceId"></input>
        <label htmlFor="categoryId">Termék kategóriája</label>
        <select id="categoryId">
          {categories.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.categoryName}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            postMethodFetch('/products')
              .then((data) => {
                alert(data.result);
              })
              .catch((err) => {
                console.error(err.message);
              });
          }}
        >
          Hozzáadás
        </button>
      </form>
    </div>
  );
}
