import { useState } from 'react';
import "./MainCategoriesMenu.css";

const CATEGORIES = {
    Category1: ['Sub Category1', 'Sub Category2', 'Sub Category3'],
    Category2: ['Sub Cat4', 'Sub Cat5'],
    Category3: ['Sub Category6', 'Sub Category7', 'Sub Category8', 'Sub Category9', 'Sub Category10']
};

export default function MainCategoriesMenu() {
    const [open, setOpen] = useState(null);

    return(
        <nav id='mainCategoriesNav'>
            <ul id='mainCategoriesList'>
                {Object.entries(CATEGORIES).map(([category, subCategories]) => (
                    <li
                        key = {category}
                        onMouseEnter={() => setOpen(category)}
                        onMouseLeave={() => setOpen(null)}
                    >
                        {category}
                        {open === category && (
                            <ul className = "subCategories">
                                {subCategories.map((subCategories) => (
                                    <li key = {subCategories}>{subCategories}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}