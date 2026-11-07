import React from 'react';
import { ShieldCheck, Sparkles, Truck, RefreshCw } from 'lucide-react';

export const ValueProps = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Verified Independent Sellers',
      description: 'Every artisan storefront is manually reviewed, verified, and approved before publishing.'
    },
    {
      icon: Sparkles,
      title: 'Artisanal Craftsmanship',
      description: 'Curated products made with fine materials, tactile finishes, and small-batch integrity.'
    },
    {
      icon: Truck,
      title: 'Direct-from-Studio Dispatch',
      description: 'Zero third-party warehouses. Items are packaged with care and shipped straight from the maker.'
    },
    {
      icon: RefreshCw,
      title: 'Safe Sandbox Checkout',
      description: 'Simulate transactions with our risk-free test checkout and receive persistent order history.'
    }
  ];

  return (
    <section id="values" className="value-props-section">
      <div className="container">
        <div className="value-props-header">
          <span className="value-props-tag">The Cartiva Philosophy</span>
          <h2 className="value-props-title">Mindful Commerce, Direct Connection</h2>
        </div>

        <div className="value-props-grid">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="pillar-card">
                <div className="pillar-icon-box">
                  <Icon size={24} className="pillar-icon" />
                </div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .value-props-section {
          padding: 4.5rem 0;
          background-color: var(--color-white);
          border-bottom: 1px solid var(--color-beige);
        }

        .value-props-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 3.5rem;
        }

        .value-props-tag {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-gold);
          display: block;
          margin-bottom: 0.5rem;
        }

        .value-props-title {
          font-size: 2.1rem;
          color: var(--color-charcoal);
        }

        .value-props-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .pillar-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 1.5rem;
          background-color: var(--color-cream-light);
          border: 1px solid var(--color-beige);
          border-radius: var(--radius-sm);
          transition: all var(--transition-normal);
        }

        .pillar-card:hover {
          transform: translateY(-3px);
          border-color: var(--color-gold);
          box-shadow: var(--shadow-md);
        }

        .pillar-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full);
          background-color: var(--color-gold-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(180, 154, 104, 0.3);
        }

        .pillar-icon {
          color: var(--color-gold);
        }

        .pillar-title {
          font-size: 1.15rem;
          color: var(--color-charcoal);
          margin-bottom: 0.6rem;
        }

        .pillar-desc {
          font-size: 0.875rem;
          color: var(--color-charcoal-muted);
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .value-props-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .value-props-grid {
            grid-template-columns: 1fr;
          }
          .value-props-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </section>
  );
};
