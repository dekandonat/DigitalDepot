import './AdminAddProduct.css';
import { useState, useEffect, useRef } from 'react';

export default function AdminAddProduct() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState('');

  const selectRef = useRef();

  useEffect(() => {
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

  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleDescriptionChange(event) {
    setDescription(event.target.value);
  }

  function handlePriceChange(event) {
    setPrice(event.target.value);
  }

  function handleImgChange(event) {
    setImg(event.target.value);
  }

  return (
    <div className="addProductDiv">
      <h1>Új termék hozzáadása</h1>
      <form id="addProductForm">
        <label htmlFor="nameId">Termék neve</label>
        <input
          type="text"
          id="nameId"
          onChange={handleNameChange}
          value={name}
        ></input>
        <label htmlFor="descriptionId">Termék leírása</label>
        <input
          type="text"
          id="descriptionId"
          onChange={handleDescriptionChange}
          value={description}
        ></input>
        <label htmlFor="imgId">Termék képe</label>
        <input
          type="text"
          id="imgId"
          onChange={handleImgChange}
          value={img}
        ></input>
        <label htmlFor="priceId">Termék ára (HUF)</label>
        <input
          type="number"
          id="priceId"
          onChange={handlePriceChange}
          value={price}
        ></input>
        <label htmlFor="categoryId">Termék kategóriája</label>
        <select id="categoryId" ref={selectRef}>
          {categories.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.categoryName}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            postMethodFetch('/products', {
              prodName: name,
              prodDescription: description,
              prodPrice: price,
              prodImg: img,
              categoryId: selectRef.current.value,
            })
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
