import { useState, useRef } from 'react';
import './AdminProductCard.css';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';

export default function AdminProductCard(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.name);
  const [price, setPrice] = useState(props.price);
  const [description, setDescription] = useState(props.description);
  const [condition, setCondition] = useState(props.condition || '');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'alert', action: '' });
  const [currentImg, setCurrentImg] = useState(props.img);
  const fileInputRef = useRef(null);

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await apiFetch(`/adminRoute/products/${props.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: {
          prodName: name,
          prodPrice: price,
          prodDescription: description,
          conditionState: condition,
        },
      });

      if (response.result == 'success') {
        setIsEditing(false);
        showToast('Sikeresen frissítve!');
      } else {
        setModal({
          isOpen: true,
          title: 'Hiba',
          message: response.message || 'Ismeretlen hiba történt.',
          type: 'alert',
          action: ''
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: 'Szerver hiba',
        message: error.message,
        type: 'alert',
        action: ''
      });
    }
  };

  const handleDeleteClick = () => {
    setModal({
      isOpen: true,
      title: 'Termék törlése',
      message: `Biztosan törölni szeretnéd a(z) ${name} terméket? Ez a művelet nem vonható vissza.`,
      type: 'confirm',
      action: 'delete'
    });
  };

  const handleConfirm = async () => {
    if (modal.action === 'delete') {
      const token = localStorage.getItem('token');
      try {
        const response = await apiFetch(`/adminRoute/products/${props.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.result == 'success') {
          closeModal();
          showToast('Sikeresen törölve!');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setModal({
            isOpen: true,
            title: 'Hiba',
            message: response.message || 'Ismeretlen hiba történt.',
            type: 'alert',
            action: ''
          });
        }
      } catch (error) {
        setModal({
          isOpen: true,
          title: 'Szerver hiba',
          message: error.message,
          type: 'alert',
          action: ''
        });
      }
    } else {
      closeModal();
    }
  };

  const handleCancel = () => {
    setName(props.name);
    setPrice(props.price);
    setDescription(props.description);
    setCondition(props.condition || '');
    setIsEditing(false);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const result = await apiFetch(`/adminRoute/product/${props.id}`, {
          method: 'PATCH',
          body: formData,
        });

        if (result.result == 'success') {
          setToast('Sikeres frissítés');
          const imgResult = await apiFetch(`/products/${props.id}`);
          if (imgResult.result == 'success') {
            setCurrentImg(imgResult.data.productImg);
          }
        } else {
          setModal({ isOpen: true, title: 'Hiba', message: result.message, type: 'alert', action: '' });
        }
      } catch (err) {
        setModal({ isOpen: true, title: 'Hiba', message: err.message, type: 'alert', action: '' });
      }
    }
  };

  return (
    <div className="adminProductCardDiv">
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={handleConfirm}
        onCancel={closeModal}
        type={modal.type || 'alert'}
      />
      {toast && <div className="toastMessage">{toast}</div>}

      <div className="productCardImgWrapper">
        <img
          src={currentImg}
          alt={name}
          className="productCardImg"
          loading="lazy"
        />

        {isEditing && (
          <div className="imageEditOverlay" onClick={handleImageClick}>
            <span className="pencilIcon">✏️</span>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*"
      />

      <div className="productCardContent">
        {isEditing ? (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="editInput"
              placeholder="Termék neve"
            />
            <div className="priceInputGroup">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="editInput"
              />
              <span>Ft</span>
            </div>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="editInput"
            >
              <option value="">Új (Nincs állapot)</option>
              <option value="bontatlan">Bontatlan</option>
              <option value="felbontott">Felbontott</option>
              <option value="használt">Használt</option>
            </select>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="editTextarea"
              rows="3"
              placeholder="Termék leírása"
            />
          </>
        ) : (
          <>
            <div className="productCardHeader">
              <h2>{name}</h2>
              <p className="productCardPrice">{price} Ft</p>
              {condition && (
                <span className="productCardCondition">{condition}</span>
              )}
            </div>
            <p className="productCardDesc">{description}</p>
            <p className="productCardDesc">
              Eladott: {props.soldQuantity || 0} db
            </p>
          </>
        )}
      </div>

      <div className="productCardActions">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="saveBtn">
              Mentés
            </button>
            <button onClick={handleCancel} className="cancelBtn">
              Mégse
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="editBtn">
              Szerkesztés
            </button>
            <button onClick={handleDeleteClick} className="deleteBtn">
              Törlés
            </button>
          </>
        )}
      </div>
    </div>
  );
}