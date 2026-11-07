import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Award, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    badge: 'Autumn / Winter 2026 Editorial',
    headingMain: 'Curated Excellence for',
    headingItalic: 'Discerning Living.',
    description:
      'Cartiva is an open multi-vendor marketplace dedicated to verified independent creators, master artisans, and studio workshops. Direct from the hands of the makers to your sanctuary.',
    tagEyebrow: 'Studio Showcase',
    tagTitle: 'Kanso Studio ANC Headphones',
    tagPrice: '₹3,899',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    fig: 'Fig. 01 — Bio-cellulose acoustic drivers & lambskin earcups by Kanso Sound'
  },
  {
    badge: 'Artisanal Ceramic Edition',
    headingMain: 'High-Fire Stoneware for',
    headingItalic: 'The Daily Brew.',
    description:
      'Wheel-thrown drippers, chawan matcha bowls, and reduction kiln ceramics designed to bring deliberate mindfulness and tactile warmth to your morning kitchen ritual.',
    tagEyebrow: 'Ceramics Atelier',
    tagTitle: 'Speckled Ceramic Pour-Over Set',
    tagPrice: '₹2,450',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80',
    fig: 'Fig. 02 — High-fire river stoneware with satin chalk glaze by Terra Stoneware'
  },
  {
    badge: 'Tuscan Leathercraft Monograph',
    headingMain: 'Vegetable Tanned Leather',
    headingItalic: 'Built to Patina.',
    description:
      'Full-grain Italian weekender duffels and cardholders hand-burnished with unbleached beeswax. Heirloom luggage designed to accompany decades of memorable expeditions.',
    tagEyebrow: 'Leather Atelier',
    tagTitle: 'Vachetta Full-Grain Weekender',
    tagPrice: '₹6,899',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
    fig: 'Fig. 03 — Hand-burnished Italian vachetta cowhide by Nomad Leather Atelier'
  }
];

export const HeroSection = ({ onExploreClick, onInspectFeatured, onOpenGiftFinder }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="hero-section">
      <div className="container hero-container">
        {/* Left Column: Editorial Headline & Story */}
        <div className="hero-text-col">
          <div className="hero-pill-badge">
            <Sparkles size={14} className="hero-badge-icon" />
            <span>{slide.badge}</span>
          </div>

          <h1 className="hero-headline">
            {slide.headingMain} <br />
            <span className="hero-headline-italic">{slide.headingItalic}</span>
          </h1>

          <p className="hero-subline">{slide.description}</p>

          <div className="hero-cta-group">
            <button onClick={onExploreClick} className="btn-primary btn-hero">
              <span>Explore 50 Master Pieces</span>
              <ArrowRight size={17} />
            </button>
            {onOpenGiftFinder && (
              <button onClick={onOpenGiftFinder} className="btn-outline btn-hero">
                <span>Gift Concierge</span>
              </button>
            )}
          </div>

          {/* Trust Metrics */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <ShieldCheck size={20} className="trust-icon" />
              <div>
                <strong className="trust-strong">6 Approved Studios</strong>
                <span className="trust-desc">Verified Provenance</span>
              </div>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <Award size={20} className="trust-icon" />
              <div>
                <strong className="trust-strong">Direct-From-Maker</strong>
                <span className="trust-desc">Complimentary Delivery</span>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="hero-slide-controls">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`slide-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Switch to hero slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Editorial Visual Showcase */}
        <div className="hero-visual-col">
          <div className="editorial-card-wrapper">
            <div className="editorial-image-frame">
              <img
                src={slide.image}
                alt={slide.tagTitle}
                className="editorial-main-img"
              />
              <div className="editorial-overlay-gradient" />

              {/* Floating Studio Badge */}
              <div className="editorial-floating-tag">
                <span className="tag-eyebrow">{slide.tagEyebrow}</span>
                <span className="tag-title">{slide.tagTitle}</span>
                <span className="tag-price">{slide.tagPrice}</span>
              </div>

              {/* Floating Quality Seal */}
              <div className="editorial-seal">
                <span className="seal-text">Approved</span>
                <span className="seal-sub">Direct Studio Run</span>
              </div>

              {/* Carousel Arrows on Card */}
              <button
                type="button"
                className="hero-arrow-btn left"
                onClick={() =>
                  setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                }
                aria-label="Previous hero slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="hero-arrow-btn right"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                aria-label="Next hero slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Micro Caption */}
            <div className="editorial-caption">
              <p className="caption-text">{slide.fig}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
