import { useState } from 'react';
import './AdminProductCard.css';
import { apiFetch } from '../assets/util/fetch';

export default function AdminProductCard(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.name);
  const [price, setPrice] = useState(props.price);
  const [description, setDescription] = useState(props.description);
  const [condition, setCondition] = useState(props.condition || '');

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
      <img src={props.img} alt={name}></img>

      <div className="NamePriceBox">
        {isEditing ? (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="editInput"
              placeholder="Termék neve"
            />
            <div className="priceInputContainer">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="editInput priceInput"
              />
              <span className="price"> Ft</span>
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
          </>
        ) : (
          <>
            <h2>{name}</h2>
            <h2 className="price">{price} Ft</h2>
            {condition && (
              <span
                style={{
                  fontSize: '0.9rem',
                  color: 'orange',
                  fontWeight: 'bold',
                }}
              >
                {condition}
              </span>
            )}
          </>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="editTextarea"
          rows="4"
        />
      ) : (
        <p>{description}</p>
      )}

      <div className="cardButtons">
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
