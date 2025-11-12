import Navbar from "./components/Navbar"; 
import MainCategoriesMenu from "./components/MainCategoriesMenu";
import MainPageGallery from "./components/MainPageGallery";
import {slides} from "./data/MainPageGalleryData.json";
import "./main.css";

export default function App() { 
  return ( 
    <> 
      <Navbar /> 
      <MainPageGallery data={slides}/>
      <MainCategoriesMenu />
    </> 
  ) 
}