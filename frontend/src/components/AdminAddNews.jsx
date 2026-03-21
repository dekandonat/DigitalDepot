import './AdminAddNews.css';
import { apiFetch } from '../assets/util/fetch';
import { useEffect, useState } from 'react';

export default function AdminAddNews() {
  const [images, setImages] = useState([]);
  const [img, setImg] = useState(null);
  const [alt, setAlt] = useState('');

  useEffect(() => {
    apiFetch('/news')
      .then((data) => {
        setImages(data.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  const handleUpload = () => {
    const formdata = new FormData();
    formdata.append('file', img);
    formdata.append('alt', alt);
    apiFetch('/adminRoute/news', {
      method: 'POST',
      body: formdata,
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const handleDelete = (id) => {
    apiFetch(`/adminRoute/news/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const handleImgChange = (e) => {
    setImg(e.target.files[0]);
  };

  const handleAltChange = (e) => {
    setAlt(e.target.value);
  };

  return (
    <>
      <div className="adminFormHeader">
        <h2>Hírek kezelése</h2>
      </div>
      <div className="adminNewsList">
        {images.map((img) => (
          <div key={img.id}>
            <img src={img.img}></img>
            <h3>{img.alt}</h3>
            <button
              type="button"
              onClick={() => {
                handleDelete(img.id);
              }}
            >
              Törlés
            </button>
          </div>
        ))}
      </div>
      <div className="adminAddNews">
        <form>
          <label htmlFor="imgAlt">Hír neve: </label>
          <input
            type="text"
            name="imgAlt"
            id="imgAlt"
            value={alt}
            onChange={handleAltChange}
          ></input>
          <br></br>
          <label htmlFor="imgFile">Kép: </label>
          <input
            type="file"
            name="imgFile"
            id="imgFile"
            onChange={handleImgChange}
          ></input>
          <br></br>
          <button type="button" onClick={handleUpload}>
            Hozzáadás
          </button>
        </form>
      </div>
    </>
  );
}
