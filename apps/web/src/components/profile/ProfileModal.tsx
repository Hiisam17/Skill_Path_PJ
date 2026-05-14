import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfileModal.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: '',
    bio: '',
    githubLink: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
        githubLink: user.githubLink || '',
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateUser(formData);
      onClose();
    } catch (error) {
      console.error('Update profile failed:', error);
      alert('Có lỗi xảy ra khi cập nhật profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Chỉnh sửa Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="profile-modal-form">
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className="form-group">
            <label htmlFor="avatarUrl">Link Avatar</label>
            <input
              type="text"
              id="avatarUrl"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="Dán link ảnh đại diện"
            />
          </div>
          <div className="form-group">
            <label htmlFor="githubLink">Link GitHub</label>
            <input
              type="url"
              id="githubLink"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Tiểu sử (Bio)</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Giới thiệu ngắn về bản thân"
              rows={3}
            />
          </div>
          <div className="profile-modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Hủy</button>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
