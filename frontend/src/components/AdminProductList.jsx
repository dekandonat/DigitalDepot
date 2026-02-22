import { useState, useEffect } from 'react';
import AdminProductCard from './AdminProductCard';
import { apiFetch } from '../assets/util/fetch';
import './AdminProductList.css';

export default function AdminProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const data = await apiFetch('/products');
            setProducts(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    fetchProducts();
  }, []);

  return (
    <div className="adminProductListWrapper">
      <div className="adminProductListHeader">
        <h2>Termékek Listája</h2>
      </div>
      
      <div className="productListGrid">
        {products.map((product) => {
          return (
            <AdminProductCard
              id={product.prodId}
              name={product.productName}
              price={product.productPrice}
              description={product.productDescription}
              key={product.prodId}
              img={product.productImg}
              condition={product.conditionState}
            />
          );
        })}
      </div>
    </div>
  );
}