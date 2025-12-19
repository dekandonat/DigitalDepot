import './AdminProductCard.css';

export default function AdminProductCard(props) {
  return (
    <div className="adminProductCardDiv">
      <img src={props.img}></img>
      <div className="NamePriceBox">
        <h2>{props.name}</h2>
        <h2 className="price">{props.price} Ft</h2>
      </div>
      <p>{props.description}</p>
    </div>
  );
}
