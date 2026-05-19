import React from 'react';
import './MilestonesModal.css';

interface MilestoneData {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface MilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: MilestoneData[];
}

const MilestonesModal: React.FC<MilestonesModalProps> = ({ isOpen, onClose, milestones }) => {
  if (!isOpen) return null;

  return (
    <div className="milestones-modal-overlay" onClick={onClose}>
      <div className="milestones-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="milestones-modal-header">
          <h2>Thành tích của bạn</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="milestones-grid-view">
          {milestones.length > 0 ? (
            milestones.map((m) => (
              <div key={m.id} className="milestone-card-detailed">
                <div className="milestone-icon-wrapper">
                  <span className="milestone-icon-large">{m.icon}</span>
                </div>
                <div className="milestone-info-detailed">
                  <h3 className="milestone-name-detailed">{m.name}</h3>
                  <p className="milestone-desc-detailed">{m.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-milestones">Bạn chưa có thành tích nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestonesModal;
