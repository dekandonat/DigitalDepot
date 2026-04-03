import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import AdminAddProduct from './AdminAddProduct';
import AdminProductList from './AdminProductList';
import AdminCreateAccount from './AdminCreateAccount';
import AdminOrdersList from './AdminOrdersList';
import AdminInventory from './AdminInventory';
import AdminUsedProducts from './AdminUsedProducts';
import AdminUsersList from './AdminUsersList';
import AdminAddNews from './AdminAddNews';
import AdminStatistics from './AdminStatistics';
import './AdminPage.css';

export default function AdminPage({ toggleChat }) {
  const [currentPage, setCurrentPage] = useState('list');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleCloseMenu = () => {
    setIsMobileMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMobileMenuClosing(false);
    }, 300);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    handleCloseMenu();
  };

  return (
    <div className="adminDashboard">
      <aside className="adminSidebar">
        <h2 className="adminLogoText">Vezérlőpult</h2>
        <nav className="adminNav">
          <button
            onClick={() => setCurrentPage('list')}
            className={
              currentPage === 'list' ? 'adminNavBtn active' : 'adminNavBtn'
            }
          >
            Termékek listája
          </button>
          
          <button
            onClick={() => setCurrentPage('news')}
            className={
              currentPage === 'news' ? 'adminNavBtn active' : 'adminNavBtn'
            }
          >
            Hírek
          </button>
          <button
            onClick={() => setCurrentPage('add')}
            className={
              currentPage === 'add' ? 'adminNavBtn active' : 'adminNavBtn'
            }
          >
            Új termék
          </button>
          <button
            onClick={() => setCurrentPage('inventory')}
            className={
              currentPage === 'inventory' ? 'adminNavBtn active' : 'adminNavBtn'
            }
          >
            Leltár kezelése
          </button>
          <button
            onClick={() => setCurrentPage('ordersList')}
            className={
              currentPage === 'ordersList'
                ? 'adminNavBtn active'
                : 'adminNavBtn'
            }
          >
            Rendelések
          </button>
          <button
            onClick={() => setCurrentPage('usedProducts')}
            className={
              currentPage === 'usedProducts'
                ? 'adminNavBtn active'
                : 'adminNavBtn'
            }
          >
            Használt termékek
          </button>

          {userRole === 'owner' && (
            <>
              <button
                onClick={() => setCurrentPage('statistics')}
                className={
                  currentPage === 'statistics' ? 'adminNavBtn active' : 'adminNavBtn'
                }
              >
                Statisztika
              </button>
              <button
                onClick={() => setCurrentPage('usersList')}
                className={
                  currentPage === 'usersList'
                    ? 'adminNavBtn active'
                    : 'adminNavBtn'
                }
              >
                Felhasználók
              </button>
              <button
                onClick={() => setCurrentPage('createAccount')}
                className={
                  currentPage === 'createAccount'
                    ? 'adminNavBtn active'
                    : 'adminNavBtn'
                }
              >
                Admin fiók
              </button>
            </>
          )}
        </nav>
      </aside>

      <main className="adminMainContent">
        <div className="adminContentWrapper">
          {currentPage === 'list' && <AdminProductList />}
          {currentPage === 'news' && <AdminAddNews />}
          {currentPage === 'add' && <AdminAddProduct />}
          {currentPage === 'inventory' && <AdminInventory />}
          {currentPage === 'ordersList' && <AdminOrdersList />}
          {currentPage === 'usedProducts' && <AdminUsedProducts />}
          {currentPage === 'statistics' && userRole === 'owner' && (
            <AdminStatistics />
          )}
          {currentPage === 'usersList' && userRole === 'owner' && (
            <AdminUsersList />
          )}
          {currentPage === 'createAccount' && userRole === 'owner' && (
            <AdminCreateAccount />
          )}
        </div>
      </main>

      <div className="adminBottomNav">
        <button
          className="adminBottomNavBtn"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="adminNavIconText">☰</span>
          <span>Vezérlőpult</span>
        </button>
        <button
          className="adminBottomNavBtn hideChatOnAdminMobile"
          onClick={toggleChat}
        >
          <span className="adminNavIconText">💬</span>
          <span>Chat</span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          className={`adminMobileMenuBg ${isMobileMenuClosing ? 'closing' : ''}`}
          onClick={handleCloseMenu}
        >
          <div
            className="adminMobileMenuContent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adminMobileMenuHeader">
              <h2>Vezérlőpult</h2>
              <button
                className="adminMobileMenuCloseBtn"
                onClick={handleCloseMenu}
              >
                &times;
              </button>
            </div>
            <div className="adminMobileNavLinks">
              <button
                onClick={() => handlePageChange('list')}
                className={
                  currentPage === 'list'
                    ? 'adminMobileNavBtn active'
                    : 'adminMobileNavBtn'
                }
              >
                Termékek listája
              </button>
              
              <button
                onClick={() => handlePageChange('news')}
                className={
                  currentPage === 'news'
                    ? 'adminMobileNavBtn active'
                    : 'adminMobileNavBtn'
                }
              >
                Hírek
              </button>
              <button
                onClick={() => handlePageChange('add')}
                className={
                  currentPage === 'add'
                    ? 'adminMobileNavBtn active'
                    : 'adminMobileNavBtn'
                }
              >
                Új termék
              </button>
              <button
                onClick={() => handlePageChange('inventory')}
                className={
                  currentPage === 'inventory'
                    ? 'adminMobileNavBtn active'
                    : 'adminMobileNavBtn'
                }
              >
                Leltár kezelése
              </button>
              <button
                onClick={() => handlePageChange('ordersList')}
                className={
                  currentPage === 'ordersList'
                    ? 'adminMobileNavBtn active'
                    : 'adminMobileNavBtn'
                }
              >
                Rendelések
              </button>
              <button
                onClick={() => handlePageChange('usedProducts')}
                className={
                  currentPage === 'usedProducts'
                    ? 'adminMobileNavBtn active'
                    : 'adminMobileNavBtn'
                }
              >
                Használt termékek
              </button>

              {userRole === 'owner' && (
                <>
                  <button
                    onClick={() => handlePageChange('statistics')}
                    className={
                      currentPage === 'statistics'
                        ? 'adminMobileNavBtn active'
                        : 'adminMobileNavBtn'
                    }
                  >
                    Statisztika
                  </button>
                  <button
                    onClick={() => handlePageChange('usersList')}
                    className={
                      currentPage === 'usersList'
                        ? 'adminMobileNavBtn active'
                        : 'adminMobileNavBtn'
                    }
                  >
                    Felhasználók
                  </button>
                  <button
                    onClick={() => handlePageChange('createAccount')}
                    className={
                      currentPage === 'createAccount'
                        ? 'adminMobileNavBtn active'
                        : 'adminMobileNavBtn'
                    }
                  >
                    Admin fiókok
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}