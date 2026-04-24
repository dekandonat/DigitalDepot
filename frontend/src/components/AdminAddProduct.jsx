import { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';
import './AdminAddProduct.css';

export default function AdminAddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState(undefined);
  const [currentMainCategory, setCurrentMainCategory] = useState('');
  const [currentSubCategory, setCurrentSubCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [newMainCategory, setNewMainCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/category');
        if (data.data) {
          setCategories(data.data);
          const mains = data.data.filter((c) => c.parentId === null);
          setMainCategories(mains);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handlePriceChange = (e) => setPrice(e.target.value);
  const handleImgChange = (e) => setImg(e.target.files[0]);
  const handleMainCatChange = (e) => {
    setCurrentMainCategory(e.target.value);
    const currentMainCat = e.target.value;
    setCurrentSubCategory('');
    setSubCategories(categories.filter((c) => c.parentId == currentMainCat));
  };
  const handleSubCategoryChange = (e) => setCurrentSubCategory(e.target.value);
  const handleNewMainCategoryChange = (e) => setNewMainCategory(e.target.value);
  const handleNewSubCategoryChange = (e) => setNewSubCategory(e.target.value);

  const handleAddProduct = () => {
    if (img == undefined) {
      setModal({
        isOpen: true,
        title: 'Hiba',
        message: 'Nem adott meg képet a termékhez!',
      });
    } else {
      const formData = new FormData();
      formData.append('prodName', name);
      formData.append('prodDescription', description);
      formData.append('prodPrice', price);
      if (currentMainCategory === 'new') {
        formData.append('newCategory', newMainCategory);
        formData.append('newSubcategory', newSubCategory);
      } else if (currentSubCategory === 'new') {
        formData.append('categoryId', currentMainCategory);
        formData.append('newSubcategory', newSubCategory);
      } else {
        formData.append(
          'categoryId',
          currentSubCategory || currentMainCategory
        );
      }
      formData.append('file', img);

      apiFetch('/adminRoute/addProduct', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })
        .then((data) => {
          if (data.result === 'success') {
            showToast('Sikeres feltöltés!');
            setName('');
            setDescription('');
            setPrice(0);
            setImg(undefined);
            document.getElementById('imgId').value = '';
          } else {
            setModal({
              isOpen: true,
              title: 'Hiba történt',
              message: data.message,
            });
          }
        })
        .catch((err) => {
          setModal({
            isOpen: true,
            title: 'Hiba',
            message: err.message,
          });
        });
    }
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
            <label htmlFor="categoryId">Főkategória</label>
            <select
              id="categoryId"
              onChange={handleMainCatChange}
              value={currentMainCategory}
            >
              <option value="" hidden disabled>
                Válassz főkategóriát...
              </option>
              {mainCategories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
              <option value="new"> + Új kategória</option>
            </select>
            {currentMainCategory == 'new' ? (
              <input
                type="text"
                value={newMainCategory}
                onChange={handleNewMainCategoryChange}
                placeholder="Adja meg az új főkategória nevét"
              ></input>
            ) : null}
          </div>

          {currentMainCategory ? (
            <div className="formControl">
              <label htmlFor="subCategoryId">Alkategória</label>
              <select
                id="subCategoryId"
                value={currentSubCategory}
                onChange={handleSubCategoryChange}
              >
                <option value="" hidden disabled>
                  Válassz főkategóriát...
                </option>
                {subCategories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
                <option value="new"> + Új alkategória</option>
              </select>
              {currentSubCategory == 'new' ? (
                <input
                  type="text"
                  value={newSubCategory}
                  onChange={handleNewSubCategoryChange}
                  placeholder="Adja meg az új alkategória nevét"
                ></input>
              ) : null}
            </div>
          ) : null}

          <div className="formControl">
            <label htmlFor="imgId">Termék képe</label>
            <input
              type="file"
              id="imgId"
              onChange={handleImgChange}
              className="fileInput"
            />
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="adminSubmitBtn"
          >
            Termék Feltöltése
          </button>
        </form>
      </div>
    </div>
  );
}
