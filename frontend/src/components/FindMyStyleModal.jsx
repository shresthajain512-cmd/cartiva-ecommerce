import React, { useState } from 'react';
import { X, Sparkles, Compass, Check, ArrowRight } from 'lucide-react';

const STYLE_PROFILES = [
  {
    id: 'zen-minimal',
    title: 'Zen Minimalist & Studio Calm',
    tagline: 'Quiet palettes, coarse stoneware, acoustic clarity & natural textures',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
    categories: ['Home & Kitchen', 'Electronics'],
    keywords: ['Matcha', 'Headphones', 'Candle']
  },
  {
    id: 'heritage-craft',
    title: 'Heritage & Old-World Leathercraft',
    tagline: 'Full-grain vachetta duffels, brass hardware, raw selvedge & tactile bindings',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    categories: ['Fashion', 'Books'],
    keywords: ['Leather', 'Denim', 'Monograph']
  },
  {
    id: 'kinetic-wellness',
    title: 'Kinetic Movement & Organic Living',
    tagline: 'Organic cork, cast iron weights, recovery rollers & botanical mists',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    categories: ['Fitness', 'Other'],
    keywords: ['Yoga', 'Kettlebell', 'Botanical']
  },
  {
    id: 'modern-analogue',
    title: 'Modern Analogue & High-End Typography',
    tagline: 'Tactile mechanical keyboards, Swiss typography essays & walnut audio',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    categories: ['Electronics', 'Books'],
    keywords: ['Keyboard', 'Typography', 'Audio']
  }
];

export const FindMyStyleModal = ({ isOpen, onClose, onApplyStyleFilter }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);

  if (!isOpen) return null;

  const handleApply = (profile) => {
    setSelectedProfile(profile.id);
    onApplyStyleFilter(profile);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="style-finder-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="style-finder-title"
      >
        <div className="gift-modal-header">
          <div className="gift-title-group">
            <Compass size={22} className="gift-icon" />
            <div>
              <h2 id="style-finder-title">Find Your Aesthetic Sanctuary</h2>
              <p className="gift-subtitle">
                Select the design ethos that resonates with your living ritual.
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close style finder">
            <X size={20} />
          </button>
        </div>

        <div className="style-profiles-grid">
          {STYLE_PROFILES.map((profile) => (
            <div
              key={profile.id}
              className={`style-profile-card ${selectedProfile === profile.id ? 'active' : ''}`}
              onClick={() => handleApply(profile)}
              role="button"
              tabIndex={0}
            >
              <div
                className="style-card-image"
                style={{ backgroundImage: `url(${profile.image})` }}
              >
                <div className="style-image-overlay" />
              </div>
              <div className="style-card-content">
                <h3 className="style-card-title">{profile.title}</h3>
                <p className="style-card-tagline">{profile.tagline}</p>
                <div className="style-card-cta">
                  <span>Explore this Aesthetic</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
