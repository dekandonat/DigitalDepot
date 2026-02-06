import './AdminAddProduct.css';
import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../assets/util/fetch';

export default function AdminAddProduct() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState(undefined);

  const selectRef = useRef();

  useEffect(() => {
    apiFetch('/category')
      .then((data) => {
        setCategories(data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

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
    setImg(event.target.files[0]);
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
        <input type="file" id="imgId" onChange={handleImgChange}></input>
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
            if (img == undefined) {
              alert('Nem adott meg képet!');
            } else {
              const formData = new FormData();
              formData.append('prodName', name);
              formData.append('prodDescription', description);
              formData.append('prodPrice', price);
              formData.append('categoryId', selectRef.current.value);
              formData.append('file', img);

              apiFetch('/products', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
              })
                .then((data) => {
                  alert(data.result);
                })
                .catch((err) => {
                  console.error(err.message);
                });
            }
          }}
        >
          Hozzáadás
        </button>
      </form>
    </div>
  );
}
