export default function AdminProductCard(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      <h2>{props.price}</h2>
      <p>{props.description}</p>
    </div>
  );
}
