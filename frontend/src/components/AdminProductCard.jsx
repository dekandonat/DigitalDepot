import { useState } from 'react';
import './AdminProductCard.css';
import { apiFetch } from '../assets/util/fetch';

export default function AdminProductCard(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.name);
  const [price, setPrice] = useState(props.price);
  const [description, setDescription] = useState(props.description);
  const [condition, setCondition] = useState(props.condition || '');
  const [toast, setToast] = useState('');

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
        alert('Hiba történt: ' + (response.message || 'Ismeretlen hiba'));
      }
    } catch (error) {
      console.error(error);
      alert('Szerver hiba történt.');
    }
  };

  const handleCancel = () => {
    setName(props.name);
    setPrice(props.price);
    setDescription(props.description);
    setCondition(props.condition || '');
    setIsEditing(false);
  };

  return (
    <div className="adminProductCardDiv">
      {toast && <div className="toastMessage">{toast}</div>}
      
      <img src={props.img} alt={name} className="productCardImg" />

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
          <button onClick={() => setIsEditing(true)} className="editBtn">
            Szerkesztés
          </button>
        )}
      </div>
    </div>
  );
}