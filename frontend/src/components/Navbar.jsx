import logo from '../assets/NavImages/logo.png';
import SearchIcon from '../assets/NavImages/search-icon.png';
import { useEffect, useState, useRef } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

export default function Navbar({
  onLoginClick,
  onProfileClick,
  onCartClick,
  onSearch,
  isAdminRoute,
  isLoggedIn,
}) {
  const navigate = useNavigate();

  return (
    <nav id="navbar">
      <img
        src={logo}
        alt="Digital Depot logo"
        id="navbarLogo"
        onClick={() => navigate('/')}
      ></img>

      <div id="navbarActions">
        {!isAdminRoute && <NavSearchBar onSearch={onSearch} />}

        {!isAdminRoute && (
          <button id="navbarCartBtn" onClick={onCartClick}></button>
        )}

        {isLoggedIn ? (
          <button id="navbarProfileBtn" onClick={onProfileClick}></button>
        ) : (
          <button id="navbarLoginBtn" onClick={onLoginClick}></button>
        )}
      </div>
    </nav>
  );
}

function NavSearchBar({ onSearch }) {
  const [searched, setSearched] = useState('');
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searched.trim()) {
      onSearch(searched);
      setIsActive(false);
    }
  };

  const handleIconClick = (e) => {
    if (window.innerWidth < 768 && !isActive) {
      e.preventDefault();
      setIsActive(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleBlur = () => {
    if (window.innerWidth < 768 && searched === '') {
      setTimeout(() => setIsActive(false), 200);
    }
  };

  return (
    <form
      className={`searchBar ${isActive ? 'active' : ''}`}
      onSubmit={handleSearchSubmit}
    >
      <input
        ref={inputRef}
        type="text"
        value={searched}
        onChange={(e) => setSearched(e.target.value)}
        onBlur={handleBlur}
        placeholder="Keresés..."
        id="navSearchText"
      ></input>
      <button type="submit" id="navSearchButton" onClick={handleIconClick}>
        <img src={SearchIcon} alt="Keresés" id="searchIconId" />
      </button>
    </form>
  );
}
