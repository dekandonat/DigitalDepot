import './AdminAddNews.css';
import { apiFetch } from '../assets/util/fetch';
import { useEffect, useState, useRef } from 'react';
import CustomModal from './CustomModal';

export default function AdminAddNews() {
  const [images, setImages] = useState([]);
  const [img, setImg] = useState(null);
  const [alt, setAlt] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

  const fileInputRef = useRef();

  useEffect(() => {
    apiFetch('/news')
      .then((data) => {
        setImages(data.data);
      })
      .catch((err) => {
        setModal({ isOpen: true, title: 'Hiba', message: err.message });
      });
  }, []);

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const handleUpload = () => {
    const formdata = new FormData();
    formdata.append('file', img);
    formdata.append('alt', alt);
    apiFetch('/adminRoute/news', {
      method: 'POST',
      body: formdata,
    })
      .then((data) => {
        setAlt('');
        fileInputRef.current.value = '';
        apiFetch('/news')
          .then((data) => {
            setImages(data.data);
          })
          .catch((err) => {
            setModal({ isOpen: true, title: 'Hiba', message: err.message });
          });
      })
      .catch((err) => {
        setModal({ isOpen: true, title: 'Hiba', message: err.message });
      });
  };

  const handleDelete = (id) => {
    apiFetch(`/adminRoute/news/${id}`, {
      method: 'DELETE',
    })
      .then((data) => {
        apiFetch('/news')
          .then((data) => {
            setImages(data.data);
          })
          .catch((err) => {
            setModal({ isOpen: true, title: 'Hiba', message: err.message });
          });
      })
      .catch((err) => {
        setModal({ isOpen: true, title: 'Hiba', message: err.message });
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
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={closeModal}
        type="alert"
      />
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
            ref={fileInputRef}
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
