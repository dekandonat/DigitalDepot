import { useState } from 'react';
import './AdminProductCard.css';

export default function AdminProductCard(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.name);
  const [price, setPrice] = useState(props.price);
  const [description, setDescription] = useState(props.description);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/products/${props.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prodName: name,
          prodPrice: price,
          prodDescription: description
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsEditing(false);
      } else {
        alert("Hiba történt: " + (data.message || "Ismeretlen hiba"));
      }
    } catch (error) {
      console.error(error);
      alert("Szerver hiba történt.");
    }
  };

  const handleCancel = () => {
    setName(props.name);
    setPrice(props.price);
    setDescription(props.description);
    setIsEditing(false);
  }

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
          </>
        ) : (
          <>
            <h2>{name}</h2>
            <h2 className="price">{price} Ft</h2>
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
            <button onClick={handleSave} className="saveBtn">Mentés</button>
            <button onClick={handleCancel} className="cancelBtn">Mégse</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="editBtn">Szerkesztés</button>
        )}
      </div>
    </div>
  );
}