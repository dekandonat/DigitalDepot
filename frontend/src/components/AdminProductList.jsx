import { useState, useEffect } from 'react';
import AdminProductCard from './AdminProductCard';
import { apiFetch } from '../assets/util/fetch';
import './AdminProductList.css';

export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(24);

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

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 24);
  };

  const currentVisibleProducts = products.slice(0, visibleCount);

  return (
    <div className="adminProductListWrapper">
      <div className="adminProductListHeader">
        <h2>Termékek Listája</h2>
      </div>
      
      <div className="productListGrid">
        {currentVisibleProducts.map((product) => {
          return (
            <AdminProductCard
              id={product.prodId}
              name={product.productName}
              price={product.productPrice}
              description={product.productDescription}
              key={product.prodId}
              img={product.productImg}
              condition={product.conditionState}
              soldQuantity={product.soldQuantity}
            />
          );
        })}
      </div>

      {visibleCount < products.length && (
        <div className="loadMoreContainer">
            <button className="loadMoreBtn" onClick={handleLoadMore}>
                Mutass többet
            </button>
        </div>
      )}
    </div>
  );
}