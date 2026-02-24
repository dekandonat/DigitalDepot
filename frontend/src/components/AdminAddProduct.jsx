import './AdminAddProduct.css';
import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';

export default function AdminAddProduct() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState(undefined);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [toast, setToast] = useState('');

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

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const handleAddProduct = () => {
    if (img == undefined) {
      setModal({ isOpen: true, title: 'Hiba', message: 'Nem adott meg képet a termékhez!' });
      return;
    }

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
        if(data.result === 'Sikeres feltöltés') {
            showToast('Sikeres feltöltés!');
            setName('');
            setDescription('');
            setPrice(0);
            setImg(undefined);
            document.getElementById('imgId').value = '';
        } else {
            setModal({ isOpen: true, title: 'Hiba történt', message: data.result });
        }
      })
      .catch((err) => {
        setModal({ isOpen: true, title: 'Szerver hiba', message: 'Nem sikerült csatlakozni a szerverhez.' });
      });
  };

  return (
    <div className="adminFormWrapper">
      <CustomModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={closeModal}
        type="alert"
      />
      
      {toast && <div className="toastMessage">{toast}</div>}

      <div className="adminFormHeader">
        <h2>Új termék hozzáadása</h2>
      </div>
      <div className="adminFormCard">
        <form className="modernAdminForm">
          <div className="formControl">
            <label htmlFor="nameId">Termék neve</label>
            <input
              type="text"
              id="nameId"
              onChange={handleNameChange}
              value={name}
            />
          </div>
          
          <div className="formControl">
            <label htmlFor="descriptionId">Termék leírása</label>
            <textarea
              id="descriptionId"
              onChange={handleDescriptionChange}
              value={description}
              rows="4"
            />
          </div>
          
          <div className="formControl">
            <label htmlFor="priceId">Termék ára (HUF)</label>
            <input
              type="number"
              id="priceId"
              onChange={handlePriceChange}
              value={price}
            />
          </div>
          
          <div className="formControl">
            <label htmlFor="categoryId">Termék kategóriája</label>
            <select id="categoryId" ref={selectRef}>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="formControl">
            <label htmlFor="imgId">Termék képe</label>
            <input type="file" id="imgId" onChange={handleImgChange} className="fileInput" />
          </div>

          <button
            type="button"
            className="adminSubmitBtn"
            onClick={handleAddProduct}
          >
            Hozzáadás
          </button>
        </form>
      </div>
    </div>
  );
}