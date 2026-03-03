import React, { useEffect, useState } from "react";
import { apiFetch } from '../assets/util/fetch';
import './MobileCategoryMenu.css';

export default function MobileCategoryMenu({ onClose, onCategorySelect, isClosing }){
    const [menuItems, setMenuItems] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});

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
                <div id="mobileMenuHeader">
                    <h2>Kategóriák</h2>
                    <button id="mobileMenuCloseBtn" onClick={onClose}>&times;</button>
                </div>

                <ul id="mobileCategoriesList">
                    {Object.entries(menuItems).map(([mainCategoryName, categoryGroupData]) => (
                        <li key={categoryGroupData.id} className="mobileMainCategory">
                            <div 
                                className="mobileCategoryHeader"
                                onClick={() => {
                                    if(categoryGroupData.subCategories.length > 0){
                                        toggleCategory(mainCategoryName);
                                    } else {
                                        onCategorySelect(categoryGroupData.id);
                                        onClose();
                                    }
                                }}
                            >
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
            </div>
        </div>
    );
}