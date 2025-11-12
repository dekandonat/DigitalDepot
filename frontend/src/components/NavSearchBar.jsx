import React from "react";
import { useState } from "react";
import "./NavSearchBar.css";
import SearchIcon from "../assets/NavImages/search-icon.png";

export default function NavSearchBar({onSearch}) {
    const [searched, setSearched] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searched);
    };

    return (
        <form className="searchBar" onSubmit={handleSearch}>
            <input
                type="text"
                value={searched}
                onChange={(e) => setSearched(e.target.value)}
                placeholder="Keressen rá valamire"
                id="navSearchText"
            ></input>
            <button
            id="navSearchButton"
            ><img src={SearchIcon} alt="Search Icon" id="searchIconId"></img></button>
        </form>
    );
}