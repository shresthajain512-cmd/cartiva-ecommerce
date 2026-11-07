import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Mail } from 'lucide-react';

export const Footer = ({ onNavigate, onOpenInfo, onSelectCategory }) => {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        {/* Directory Columns */}
        <div className="footer-columns-grid">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="brand-title">CARTIVA</span>
              <span className="brand-subtitle">Editorial Marketplace</span>
            </div>
            <p className="brand-narrative">
              A curated e-commerce sanctuary celebrating authentic multi-vendor independence,
              heirloom materials, and mindful living. 50 handcrafted master pieces direct from
              certified creator studios across India and international workshops.
            </p>
            <div className="footer-maker-badge">
              <ShieldCheck size={16} />
              <span>100% Verified Independent Makers</span>
            </div>
          </div>

          {/* Column 1: Craft Categories */}
          <div className="footer-col">
            <h4 className="col-heading">Craft Disciplines</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => onSelectCategory('Electronics')}>
                  Audio & Electronics
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory('Fashion')}>
                  Leathercraft & Fashion
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory('Home & Kitchen')}>
                  Studio Ceramics & Kitchen
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory('Books')}>
                  Rare Monographs & Prints
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory('Fitness')}>
                  Cork Fitness & Wellness
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectCategory('Other')}>
                  Apothecary & Candles
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Navigation & Discovery */}
          <div className="footer-col">
            <h4 className="col-heading">Marketplace Discovery</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => onNavigate('catalogue')}>
                  Master Catalogue (50 Items)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('collections')}>
                  Curated Thematic Lookbooks
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('artisans')}>
                  Meet the 6 Independent Studios
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('offers')}>
                  Seasonal Archive Offers
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('wishlist')}>
                  Personal Saved Wishlist
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('account')}>
                  My Account & Order Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Concierge & Policies */}
          <div className="footer-col">
            <h4 className="col-heading">Client Services & Policies</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => onOpenInfo('about')}>
                  About Cartiva Sanctuary
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('contact')}>
                  Studio Concierge & Contact
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('faqs')}>
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('shipping')}>
                  Shipping & Courier Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('returns')}>
                  14-Day Doorstep Returns
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('privacy')}>
                  Privacy & Data Charter
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenInfo('terms')}>
                  Terms & Service Standards
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="footer-bottom-row">
          <p className="copyright-text">
            © 2026 Cartiva Inc. All rights reserved. Curated Luxury Editorial Marketplace.
          </p>
          <div className="tech-badge">
            <span>Verified MongoDB Catalogue • Express API • React 19 Client</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
