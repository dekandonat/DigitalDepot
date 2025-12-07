import { useState, useEffect } from 'react';
import "./MainCategoriesMenu.css";

export default function MainCategoriesMenu({ onCategorySelect }) {
    const [open, setOpen] = useState(null);
    const [menuItems, setMenuItems] = useState({});

    useEffect(() => {
        const getMethodFetch = (url) => {
            return fetch(url)
            .then((response) => {
                if(!response.ok) {
                    throw new Error(`GET hiba: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .catch((error) => {
                throw new Error(`Hiba történt: ${error.message}`);
            });
        }

        const fetchCategories = async() => {
            const url = '/category';

            try{
                const result = await getMethodFetch(url);
                if(result.data){
                    processCategories(result.data);
                }
            } catch(error) {
                console.error("Hiba a menü betöltésekor: ", error);
            }
        }

        const processCategories = (categories) => {
            if(categories.length === 0) return;

            const tempMenu = {};
            
            for(let i = 0; i < categories.length; i++){
                if(categories[i].parentId === null){
                    const children = [];
                    
                    for(let j = 0; j < categories.length; j++){
                        if(categories[j].parentId === categories[i].categoryId){
                            children.push(categories[j]);
                        }
                    }

                    tempMenu[categories[i].categoryName] = {
                        id: categories[i].categoryId,
                        subCategories: children
                    };
                }
            }
            setMenuItems(tempMenu);
        }

        fetchCategories();
    }, []);

    return(
        <nav id='mainCategoriesNav'>
            <ul id='mainCategoriesList'>
                {Object.entries(menuItems).map(([mainCatName, data]) => (
                    <li
                        key = {data.id}
                        onMouseEnter={() => setOpen(mainCatName)}
                        onMouseLeave={() => setOpen(null)}
                        onClick={() => onCategorySelect(data.id)}
                    >
                        {mainCatName}

                        {open === mainCatName && data.subCategories.length > 0 && (
                            <ul className = "subCategories">
                                {data.subCategories.map((sub) => (
                                    <li 
                                        key={sub.categoryId}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCategorySelect(sub.categoryId);
                                        }}
                                    >
                                        {sub.categoryName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}

                <li onClick={() => onCategorySelect(null)} id="allItemsId">
                    &times;
                </li>
            </ul>
        </nav>
    );
}