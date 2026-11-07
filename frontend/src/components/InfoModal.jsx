import React from 'react';
import { X, ShieldCheck, HelpCircle, FileText, Mail, Truck, RefreshCw } from 'lucide-react';

const INFO_CONTENT = {
  about: {
    title: 'About Cartiva',
    icon: ShieldCheck,
    body: (
      <>
        <p>
          Cartiva is a curated luxury editorial multi-vendor marketplace connecting discerning patrons
          directly with verified independent makers, family-run foundries, ceramicists, and boutique publishers.
        </p>
        <p>
          Every piece in our catalogue adheres to strict principles: direct studio provenance, authentic materials,
          zero synthetic shortcuts, and fair compensation for independent artisans across India and partner international studios.
        </p>
        <h4>Our Verification Standard</h4>
        <p>
          Unlike unvetted aggregators, every artisan on Cartiva undergoes thorough manual vetting for craftsmanship authenticity,
          sustainable raw material sourcing, and operational dispatch reliability before receiving approval to publish products.
        </p>
      </>
    )
  },
  contact: {
    title: 'Studio Concierge & Contact',
    icon: Mail,
    body: (
      <>
        <p>
          Our editorial team and artisan support concierge are available Monday through Saturday, 9:00 AM – 7:00 PM IST.
        </p>
        <div className="contact-details-box">
          <p><strong>Artisan Concierge:</strong> concierge@cartiva-studio.com</p>
          <p><strong>Studio Inquiries:</strong> makers@cartiva-studio.com</p>
          <p><strong>Direct Helpline:</strong> +91 (080) 4567 8900</p>
          <p><strong>Physical Atelier:</strong> 42, Vayu Marg, Indiranagar, Bengaluru, Karnataka 560038</p>
        </div>
      </>
    )
  },
  faqs: {
    title: 'Frequently Asked Questions',
    icon: HelpCircle,
    body: (
      <>
        <div className="faq-item">
          <h4>Are products authentic and made directly by artisans?</h4>
          <p>
            Yes. Every order is allocated directly to the verified artisan or studio workshop listed on the product card.
            We do not sell mass-manufactured drop-shipped goods.
          </p>
        </div>
        <div className="faq-item">
          <h4>How does domestic shipping work?</h4>
          <p>
            Complimentary insured express delivery is automatically applied to all domestic orders over ₹2,999.
            Average delivery takes 2 to 4 business days depending on your destination city.
          </p>
        </div>
        <div className="faq-item">
          <h4>What is your return policy?</h4>
          <p>
            We provide a 14-day doorstep return guarantee on all standard catalog pieces. If an item arrives damaged
            or does not meet studio expectations, our courier will collect it free of charge.
          </p>
        </div>
      </>
    )
  },
  shipping: {
    title: 'Shipping & Delivery Policy',
    icon: Truck,
    body: (
      <>
        <p>
          All Cartiva deliveries are dispatched in custom recyclable honeycomb cardboard and natural biodegradable padding.
        </p>
        <h4>Delivery Timelines</h4>
        <ul>
          <li>Metro Cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai): 2–3 business days</li>
          <li>Rest of India: 3–5 business days</li>
          <li>Highland & Remote postal codes: 5–7 business days</li>
        </ul>
        <p>
          All parcels are insured up to full item value against courier loss or transit damage.
        </p>
      </>
    )
  },
  returns: {
    title: 'Returns & Refund Policy',
    icon: RefreshCw,
    body: (
      <>
        <p>
          We want you to be completely delighted with your artisanal pieces. We provide a 14-day hassle-free return window
          from the date of doorstep delivery.
        </p>
        <p>
          Returned pieces must be unused, in their original studio packaging with authentication certificates intact.
          Refunds are credited directly to your original payment method within 3–5 business days following return inspection.
        </p>
      </>
    )
  },
  privacy: {
    title: 'Privacy & Security Policy',
    icon: FileText,
    body: (
      <>
        <p>
          Cartiva values your privacy. We never sell, lease, or monetize customer browsing or purchasing data.
          All sensitive transactions and account credentials are encrypted with industry-standard bcrypt salting and secure JWT tokens.
        </p>
      </>
    )
  },
  terms: {
    title: 'Terms & Conditions',
    icon: FileText,
    body: (
      <>
        <p>
          By engaging with the Cartiva marketplace, patrons agree to respectful interaction with independent makers.
          Prices are indicated in Indian Rupees (₹) inclusive of applicable goods and services tax (GST).
        </p>
      </>
    )
  }
};

export const InfoModal = ({ infoKey, onClose }) => {
  if (!infoKey || !INFO_CONTENT[infoKey]) return null;

  const content = INFO_CONTENT[infoKey];
  const IconComponent = content.icon;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="info-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        <div className="info-modal-header">
          <div className="info-title-group">
            <IconComponent size={22} className="info-icon" />
            <h2 id="info-modal-title">{content.title}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close information modal">
            <X size={20} />
          </button>
        </div>

        <div className="info-modal-body">
          {content.body}
        </div>

        <div className="info-modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
