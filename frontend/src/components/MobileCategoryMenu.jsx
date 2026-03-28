import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { apiFetch } from '../assets/util/fetch';
import './MobileCategoryMenu.css';

export default function MobileCategoryMenu({ onClose, onCategorySelect, onSortSelect, isClosing }){
    const [menuItems, setMenuItems] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});
    const location = useLocation();
    const currentSort = new URLSearchParams(location.search).get('sort') || 'default';

    useEffect(() => {
        const fetchCategories = async() => {
            try{
                const result = await apiFetch('/category');
                if(result.data){
                    processCategories(result.data);
                }
            } catch(error) {
                console.error(error);
            }
        }
        fetchCategories();
    }, []);

    const processCategories = (categories) => {
        if(categories.length === 0) return;
        const temporaryMenuItems = {};
        
        for(let i = 0; i < categories.length; i++){
            if(categories[i].parentId === null){
                const childrenCategories = categories.filter(category => category.parentId === categories[i].categoryId);
                temporaryMenuItems[categories[i].categoryName] = {
                    id: categories[i].categoryId,
                    subCategories: childrenCategories
                };
            }
        }
        setMenuItems(temporaryMenuItems);
    }

    const toggleCategory = (categoryName) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    return (
        <div id="mobileMenuBackground" className={isClosing ? 'closing' : ''} onClick={onClose}>
            <div id="mobileMenuContent" onClick={(e) => e.stopPropagation()}>
                
                <div className="mobileMenuHeaderTitle">Kategóriák</div>

                <div className="mobileMenuScrollArea">
                    <ul className="mobileMainCategories">
                        {Object.entries(menuItems).map(([mainCategoryName, categoryGroupData]) => (
                            <li key={categoryGroupData.id}>
                                <div className="mobileCategoryHeader" onClick={() => toggleCategory(mainCategoryName)}>
                                    <span 
                                        className="mobileCategoryTitle"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCategorySelect(categoryGroupData.id);
                                            onClose();
                                        }}
                                    >
                                        {mainCategoryName}
                                    </span>
                                    {categoryGroupData.subCategories.length > 0 && (
                                        <div className="mobileCategoryToggle">
                                            <span className="mobileCatArrow">
                                                {expandedCategories[mainCategoryName] ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {expandedCategories[mainCategoryName] && categoryGroupData.subCategories.length > 0 && (
                                    <ul className="mobileSubCategories">
                                        {categoryGroupData.subCategories.map(sub => (
                                            <li 
                                                key={sub.categoryId}
                                                onClick={() => {
                                                    onCategorySelect(sub.categoryId);
                                                    onClose();
                                                }}
                                            >
                                                {sub.categoryName}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="mobileSortSection">
                        <label className="mobileSortLabel">Rendezés:</label>
                        <select 
                            className="mobileSortSelect" 
                            value={currentSort} 
                            onChange={(e) => {
                                onSortSelect(e.target.value);
                            }}
                        >
                            <option value="default">Alapértelmezett</option>
                            <option value="sold_desc">Eladások szerint csökkenő</option>
                            <option value="sold_asc">Eladások szerint növekvő</option>
                            <option value="price_asc">Ár szerint növekvő</option>
                            <option value="price_desc">Ár szerint csökkenő</option>
                            <option value="rating_desc">Értékelés szerint csökkenő</option>
                            <option value="rating_asc">Értékelés szerint növekvő</option>
                        </select>
                    </div>
                </div>

            </div>
        </div>
    );
}