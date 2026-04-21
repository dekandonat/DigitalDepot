import './CustomModal.css';

export default function CustomModal({ isOpen, title, message, onConfirm, onCancel, type = 'alert', confirmText, children }) {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onMouseDown={onCancel || onConfirm}>
      <div className="modalContent" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modalTitle">{title}</h3>
        {message && <p className="modalMessage">{message}</p>}
        
        {children}
        
        <div className="modalActions">
          {(type === 'confirm' || type === 'custom') && (
            <button className="modalCancelBtn" onClick={onCancel}>
              Mégse
            </button>
          )}
          <button 
            className={`modalConfirmBtn ${type}`} 
            onClick={onConfirm}
          >
            {confirmText || (type === 'confirm' ? 'Igen, törlöm' : 'Rendben')}
          </button>
        </div>
      </div>
    </div>
  );
}