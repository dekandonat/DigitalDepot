import React from "react";
import { useState } from "react";
import "./NavSearchBar.css";

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
            <input 
                type="button"
                value="Keresés"
                id="navSearchButton"
            ></input>
        </form>
    );
}