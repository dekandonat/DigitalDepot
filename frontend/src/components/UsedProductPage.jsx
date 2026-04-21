import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';
import './UsedProductPage.css';

const formatPrice = (price) => {
  return parseInt(price).toLocaleString('hu-HU').replaceAll(',', ' ');
};

function UserSubmissions({ activeTab, refreshTrigger }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localTrigger, setLocalTrigger] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchUserSubmissions() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const result = await apiFetch('/used-products/my-submissions');
        if (result.result === 'success') {
          setSubmissions(result.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fetchUserSubmissions();
  }, [refreshTrigger, localTrigger, token]);

  const handleDecision = async (submissionId, decision) => {
    try {
      const result = await apiFetch('/used-products/user-response', {
        method: 'PATCH',
        body: { submissionId, decision },
      });
      if (result.result === 'success') {
        setLocalTrigger((prev) => prev + 1);
      }
    } catch (err) {}
  };

  if (loading) return <p className="loadingMsg">Beküldéseid betöltése...</p>;

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeTab === 'inProgress')
      return ['pending', 'accepted'].includes(sub.status);
    if (activeTab === 'closed')
      return [
        'rejected',
        'offer_accepted',
        'offer_rejected',
        'listed',
      ].includes(sub.status);
    return false;
  });

  if (activeTab === 'form') return null;

  return (
    <div id="userSubmissionsSection">
      <div className="submissionGrid">
        {filteredSubmissions.length === 0 ? (
          <p className="noDataMsg">Nincs találat ebben a kategóriában.</p>
        ) : (
          filteredSubmissions.map((submission) => (
            <div
              key={submission.submissionId}
              className={`submissionCard status-${submission.status}`}
            >
              {submission.productImage && (
                <img
                  src={
                    submission.productImage.startsWith('/')
                      ? submission.productImage
                      : `/${submission.productImage}`
                  }
                  alt={submission.productName}
                  className="submissionCardImg"
                />
              )}
              <span className={`conditionBadge ${submission.conditionState}`}>
                {submission.conditionState}
              </span>
              <div className="submissionCardContent">
                <h3>{submission.productName}</h3>
                <p className="submissionCardDesc">
                  {submission.productDescription}
                </p>
                <p>
                  Beküldve:{' '}
                  <strong>
                    {new Date(submission.submissionDate).toLocaleDateString()}
                  </strong>
                </p>
                <span className={`statusLabel ${submission.status}`}>
                  {submission.status === 'pending'
                    ? 'Értékelés alatt'
                    : submission.status === 'accepted'
                      ? 'Ajánlat kiküldve'
                      : submission.status === 'rejected'
                        ? 'Elutasítva'
                        : submission.status === 'offer_accepted'
                          ? 'Ajánlat elfogadva'
                          : submission.status === 'offer_rejected'
                            ? 'Ajánlat elutasítva'
                            : 'Publikálva'}
                </span>
                {(submission.status === 'accepted' ||
                  submission.status === 'offer_accepted' ||
                  submission.status === 'listed') &&
                  submission.adminOfferPrice && (
                    <p className="offerPrice">
                      Ajánlott ár:{' '}
                      <strong>
                        {formatPrice(submission.adminOfferPrice)} Ft
                      </strong>
                    </p>
                  )}
                {submission.status === 'accepted' && (
                  <div className="userDecisionRow">
                    <button
                      onClick={() =>
                        handleDecision(submission.submissionId, 'accept')
                      }
                      className="decisionBtn acceptOfferBtn"
                    >
                      Elfogadom
                    </button>
                    <button
                      onClick={() =>
                        handleDecision(submission.submissionId, 'reject')
                      }
                      className="decisionBtn rejectOfferBtn"
                    >
                      Elutasítom
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SubmissionForm({ onSubmissionSuccess }) {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [conditionState, setConditionState] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankInput, setBankInput] = useState('');

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProductData = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('productDescription', productDescription);
    formData.append('conditionState', conditionState);
    formData.append('file', imageFile);

    try {
      const result = await apiFetch('/used-products/submit', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });

      if (result.result === 'success') {
        setModal({
          isOpen: true,
          title: 'Siker',
          message: 'Termék sikeresen beküldve! Az adminisztrátor hamarosan értékeli.',
          type: 'alert',
          onConfirm: () => {
            setModal({ ...modal, isOpen: false });
            setProductName('');
            setProductDescription('');
            setConditionState('');
            setImageFile(null);
            setImagePreview(null);
            if (onSubmissionSuccess) onSubmissionSuccess();
          },
        });
      } else {
        setModal({
          isOpen: true,
          title: 'Hiba',
          message: result.message || 'Hiba történt a beküldés során.',
          type: 'alert',
        });
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('bankszámla')) {
        setBankModalOpen(true);
      } else {
        setModal({
          isOpen: true,
          title: 'Hiba',
          message: err.message,
          type: 'alert',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setModal({
        isOpen: true,
        title: 'Hiba',
        message: 'Kérjük, jelentkezz be a termék leadásához!',
        type: 'alert',
      });
      return;
    }

    if (!conditionState) {
      setModal({
        isOpen: true,
        title: 'Hiba',
        message: 'Válassz állapotot!',
        type: 'alert',
      });
      return;
    }

    if (!imageFile) {
      setModal({
        isOpen: true,
        title: 'Hiba',
        message: 'Kérlek tölts fel egy képet a termékről!',
        type: 'alert',
      });
      return;
    }

    submitProductData();
  };

  const handleBankSaveAndSubmit = async () => {
    try {
      const patchResult = await apiFetch('/user/bank-account', {
        method: 'PATCH',
        body: { bankAccountNumber: bankInput },
      });
      if (patchResult.result === 'success') {
        setBankModalOpen(false);
        submitProductData();
      }
    } catch (err) {
      setModal({
        isOpen: true,
        title: 'Hiba',
        message: err.message,
        type: 'alert',
      });
    }
  };

  return (
    <div id="submissionFormSection">
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={
          modal.onConfirm || (() => setModal({ ...modal, isOpen: false }))
        }
      />

      <CustomModal
        isOpen={bankModalOpen}
        title="Hiányzó bankszámlaszám"
        message="A termék beküldéséhez kérlek, add meg a bankszámlaszámodat, ahova az összeget utalhatjuk!"
        type="custom"
        confirmText="Mentés és Beküldés"
        onConfirm={handleBankSaveAndSubmit}
        onCancel={() => setBankModalOpen(false)}
      >
        <input
          type="text"
          className={`formInputField bankModalInput ${
            bankInput.length === 27 ? 'validBank' : 'invalidBank'
          }`}
          placeholder="HU 000000000000000000000000"
          value={bankInput}
          onChange={(e) => setBankInput(e.target.value)}
          maxLength="27"
        />
      </CustomModal>

      <h2>Új termék beküldése felvásárlásra</h2>
      <form onSubmit={handleSubmit} id="usedProductSubmitForm">
        <input
          type="text"
          placeholder="Termék neve (pl. iPhone 13 Pro 128GB)"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          className="formInputField"
        />
        <textarea
          placeholder="Részletes leírás (pl. állapot, tartozékok, hálózati zár, akku százalék, esztétikai hibák)"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          rows="5"
          required
          className="formTextareaField"
        />

        <div className="formFieldGroup">
          <select
            value={conditionState}
            onChange={(e) => setConditionState(e.target.value)}
            id="conditionSelectField"
            required
          >
            <option value="">-- Válassz állapotot --</option>
            <option value="bontatlan">Bontatlan (Új)</option>
            <option value="felbontott">Felbontott</option>
            <option value="használt">Használt, kifogástalan</option>
            <option value="hibás">Hibás / Alkatrésznek</option>
          </select>
        </div>

        <div className="formFieldGroup">
          <label htmlFor="imageFile" className="fileInputLabel">
            {imageFile ? 'Kép feltöltve' : 'Tölts fel egy képet a termékről'}
          </label>
          <input
            type="file"
            id="imageFile"
            accept="image/*"
            onChange={handleImageChange}
            required={!imagePreview}
            className="fileInputField"
          />
        </div>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Termék előnézet"
            className="submissionImagePreview"
          />
        )}

        <button type="submit" disabled={loading} className="formSubmitButton">
          {loading ? 'Beküldés...' : 'Termék Beküldése'}
        </button>
      </form>
    </div>
  );
}

export default function UsedProductPage() {
  const [submissionCount, setSubmissionCount] = useState(0);
  const [activeTab, setActiveTab] = useState('form');

  const handleSubmissionSuccess = () => {
    setSubmissionCount((prev) => prev + 1);
    setActiveTab('inProgress');
  };

  return (
    <div id="usedProductPageContainer">
      <div className="pageHeader">
        <h1>Használt Termék Felvásárlás</h1>
        <p>
          Add el régi elektronikai eszközeidet! Küldd be az adatokat, és
          hamarosan ajánlatot teszünk.
        </p>
      </div>

      <div className="tabsNav">
        <button
          className={`tabBtn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Termék beküldése
        </button>
        <button
          className={`tabBtn ${activeTab === 'inProgress' ? 'active' : ''}`}
          onClick={() => setActiveTab('inProgress')}
        >
          Korábbi beküldések
        </button>
        <button
          className={`tabBtn ${activeTab === 'closed' ? 'active' : ''}`}
          onClick={() => setActiveTab('closed')}
        >
          Lezárt beküldések
        </button>
      </div>

      {activeTab === 'form' && (
        <SubmissionForm onSubmissionSuccess={handleSubmissionSuccess} />
      )}

      <UserSubmissions activeTab={activeTab} refreshTrigger={submissionCount} />
    </div>
  );
}