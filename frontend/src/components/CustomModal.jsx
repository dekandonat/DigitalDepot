import './CustomModal.css';

export default function CustomModal({ isOpen, title, message, onConfirm, onCancel, type = 'alert' }) {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onMouseDown={onCancel || onConfirm}>
      <div className="modalContent" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">{title}</h3>
        <p className="modalMessage">{message}</p>
        
        <div className="modalActions">
          {type === 'confirm' && (
            <button className="modalCancelBtn" onClick={onCancel}>
              Mégse
            </button>
          )}
          <button 
            className={`modalConfirmBtn ${type}`} 
            onClick={onConfirm}
          >
            {type === 'confirm' ? 'Igen, törlöm' : 'Rendben'}
          </button>
        </div>
      </div>
    </div>
  );
}