import React from 'react';
import { Store, MapPin, ArrowRight, CheckCircle, Sparkles, Star } from 'lucide-react';

const ARTISANS_DIRECTORY = [
  {
    name: 'Kanso Sound & Acoustics',
    founder: 'Kaito Tanaka',
    category: 'Audio & Precision Electronics',
    location: 'Kyoto & Bengaluru Studios',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    description:
      'Minimalist acoustic engineering, tactile CNC keyboards, and studio audio drivers with bio-cellulose diaphragms designed for distraction-free listening.',
    itemCount: '8 Master Pieces'
  },
  {
    name: 'Nomad Leather Atelier',
    founder: 'Elena Rostova',
    category: 'Leathercraft & Heritage Apparel',
    location: 'Florence & Jaipur',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    description:
      'Full-grain Italian vachetta weekender duffels, hand-burnished card sleeves, and raw selvedge denim jackets hand-saddle-stitched for lifetime endurance.',
    itemCount: '9 Master Pieces'
  },
  {
    name: 'Terra Stoneware Studio',
    founder: 'Arjun Mehta',
    category: 'Ceramics & Culinary Objects',
    location: 'Khurja & Pondicherry',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    description:
      'Reduction kiln fired stoneware pour-over drippers, chawan matcha bowls, and heavy cast iron dutch ovens finished with satin food-safe glazes.',
    itemCount: '9 Master Pieces'
  },
  {
    name: 'Sonder Books & Prints',
    founder: 'Clara Oswald',
    category: 'Independent Publishing & Monographs',
    location: 'Edinburgh & Mumbai',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    description:
      'Linen quarter-bound architectural monographs, Swiss typography manifestos, and Heidelberg letterpress botanical prints on 100% cotton rag.',
    itemCount: '8 Master Pieces'
  },
  {
    name: 'Prana Movement Lab',
    founder: 'Vikram Singhania',
    category: 'Kinetic Conditioning & Cork Essentials',
    location: 'Rishikesh & Goa',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    description:
      'Organic cork yoga mats, single-pour cast iron kettlebells, and dense myofascial mobility rollers promoting mindful physical movement.',
    itemCount: '8 Master Pieces'
  },
  {
    name: 'Aethel Botanical & Living',
    founder: 'Maya Lin',
    category: 'Apothecary, Scents & Desk Objects',
    location: 'Dehradun Foothills',
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    description:
      'Small-batch hand-poured soy candles in mouth-blown amber tumblers, steam-distilled room mists, and spun raw brass meditation vessels.',
    itemCount: '8 Master Pieces'
  }
];

export const ArtisansPage = ({ onSelectArtisan, onExploreCatalogue }) => {
  return (
    <div className="artisans-page">
      <div className="container">
        {/* Header */}
        <div className="artisans-hero-header">
          <span className="artisans-eyebrow">Direct-From-Studio Provenance</span>
          <h1 className="artisans-title">The Independent Makers & Ateliers</h1>
          <p className="artisans-subtitle">
            Cartiva exclusively partners with independent craftspeople, family-run foundries,
            and small publishing presses committed to heritage methods and sustainable batch runs.
          </p>
        </div>

        {/* Artisans Grid */}
        <div className="artisans-directory-grid">
          {ARTISANS_DIRECTORY.map((artisan) => (
            <div key={artisan.name} className="artisan-directory-card">
              <div className="artisan-card-media">
                <img src={artisan.image} alt={artisan.name} className="artisan-bg-img" />
                <div className="artisan-media-overlay">
                  <span className="artisan-count-badge">{artisan.itemCount}</span>
                </div>
              </div>

              <div className="artisan-card-body">
                <div className="artisan-identity-row">
                  <img src={artisan.avatar} alt={artisan.founder} className="artisan-avatar" />
                  <div className="artisan-name-group">
                    <h3 className="artisan-studio-name">{artisan.name}</h3>
                    <span className="artisan-category-name">{artisan.category}</span>
                  </div>
                </div>

                <div className="artisan-location-row">
                  <MapPin size={13} />
                  <span>{artisan.location}</span>
                  <span className="dot">•</span>
                  <div className="artisan-verified-pill">
                    <CheckCircle size={12} />
                    <span>Approved Maker</span>
                  </div>
                </div>

                <p className="artisan-card-desc">{artisan.description}</p>

                <div className="artisan-card-footer">
                  <button
                    type="button"
                    className="btn-visit-storefront"
                    onClick={() => onSelectArtisan(artisan.name)}
                  >
                    <span>Visit Studio Storefront</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
