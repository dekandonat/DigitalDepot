import { useState, useEffect } from 'react';
import AdminProductCard from './AdminProductCard';
import './AdminProductList.css';

export default function AdminProductList() {
  const [products, setProducts] = useState([]);

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

    getMethodFetch('/products')
      .then((data) => {
        setProducts(data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="flexBox">
      <h1>Termékek Listája</h1>
      <div className="productListDiv">
        {products.map((product) => {
          return (
            <AdminProductCard
              id={product.prodId}
              name={product.productName}
              price={product.productPrice}
              description={product.productDescription}
              key={product.prodId}
              img={product.productImg}
            />
          );
        })}
      </div>
    </div>
  );
}