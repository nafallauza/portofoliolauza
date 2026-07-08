import React, { useState, useRef } from 'react';
import './ProfileCard.css';

export default function ProfileCard({ image, name, role }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shineX, setShineX] = useState(50);
  const [shineY, setShineY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt rotations (max 12 degrees for natural feel)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 12;

    // Calculate shine position (percentage)
    const shinePx = (x / rect.width) * 100;
    const shinePy = (y / rect.height) * 100;

    setRotateX(rotX);
    setRotateY(rotY);
    setShineX(shinePx);
    setShineY(shinePy);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="profile-card-container">
      <div
        ref={cardRef}
        className={`profile-card ${isHovered ? 'hovered' : ''}`}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovered ? 'none' : 'transform 0.5s ease-out'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Holographic Rainbow Shine Overlay */}
        <div
          className="holo-shine"
          style={{
            background: `radial-gradient(circle at ${shineX}% ${shineY}%, 
              rgba(255, 255, 255, 0.2) 0%, 
              rgba(255, 0, 128, 0.12) 20%, 
              rgba(0, 255, 255, 0.12) 45%, 
              rgba(255, 255, 0, 0.12) 70%, 
              transparent 100%)`,
            opacity: isHovered ? 0.95 : 0
          }}
        />
        
        {/* Holographic Sparkle Grid */}
        <div className="holo-sparkles" style={{ opacity: isHovered ? 0.45 : 0 }} />

        {/* Profile Content */}
        <div className="profile-card-inner">
          <div className="profile-card-image-container">
            <img src={image} alt={name} className="profile-card-photo" />
          </div>
          <div className="profile-card-info">
            <h4 className="profile-card-name">{name}</h4>
            <p className="profile-card-role">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
