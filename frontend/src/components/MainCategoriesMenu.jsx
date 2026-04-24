import { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import './MainCategoriesMenu.css';

export default function MainCategoriesMenu({ onCategorySelect }) {
  const [openCategoryName, setOpenCategoryName] = useState(null);
  const [menuItems, setMenuItems] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryApiUrl = '/category';

      try {
        const result = await apiFetch(categoryApiUrl);
        if (result.data) {
          processCategories(result.data);
        }
      } catch (error) {
        console.error('Hiba a menü betöltésekor: ', error);
      }
    };

    const processCategories = (categories) => {
      if (categories.length !== 0) {
        const temporaryMenuItems = {};

        for (let i = 0; i < categories.length; i++) {
          if (categories[i].parentId === null) {
            const childrenCategories = categories.filter(
              (category) => category.parentId === categories[i].categoryId
            );

            temporaryMenuItems[categories[i].categoryName] = {
              id: categories[i].categoryId,
              subCategories: childrenCategories,
            };
          }
        }
        setMenuItems(temporaryMenuItems);
      }
    };

    fetchCategories();
  }, []);

  return (
    <nav id="mainCategoriesNav">
      <ul id="mainCategoriesList">
        {Object.entries(menuItems).map(
          ([mainCategoryName, categoryGroupData]) => (
            <li
              key={categoryGroupData.id}
              onMouseEnter={() => setOpenCategoryName(mainCategoryName)}
              onMouseLeave={() => setOpenCategoryName(null)}
              onClick={() => onCategorySelect(categoryGroupData.id)}
            >
              {mainCategoryName}

              {openCategoryName === mainCategoryName &&
                categoryGroupData.subCategories.length > 0 && (
                  <ul className="subCategories">
                    {categoryGroupData.subCategories.map((subCategory) => (
                      <li
                        key={subCategory.categoryId}
                        onClick={(event) => {
                          event.stopPropagation();
                          onCategorySelect(subCategory.categoryId);
                        }}
                      >
                        {subCategory.categoryName}
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          )
        )}
      </ul>
    </nav>
  );
}
