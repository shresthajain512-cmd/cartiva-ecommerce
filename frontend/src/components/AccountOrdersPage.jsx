import React, { useState } from 'react';
import { User, Package, MapPin, ShieldCheck, Clock, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

const SAMPLE_ORDERS = [
  {
    orderId: 'CTV-8921-2026',
    date: '28 October 2026',
    status: 'Delivered',
    total: 3899,
    items: [
      {
        title: 'Kanso Studio ANC Wireless Headphones',
        store: 'Kanso Sound & Acoustics',
        quantity: 1,
        price: 3899,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  {
    orderId: 'CTV-7410-2026',
    date: '14 September 2026',
    status: 'Delivered',
    total: 3340,
    items: [
      {
        title: 'Speckled Ceramic Pour-Over Dripper & Glass Carafe',
        store: 'Terra Stoneware Studio',
        quantity: 1,
        price: 2450,
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=400&q=80'
      },
      {
        title: 'Handcrafted Speckled Stoneware Espresso Mug',
        store: 'Terra Stoneware Studio',
        quantity: 1,
        price: 890,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80'
      }
    ]
  }
];

export const AccountOrdersPage = ({ onBack, onExploreCatalogue }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses'

  return (
    <div className="account-orders-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="account-nav-bar">
          <button type="button" className="breadcrumb-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Shopping</span>
          </button>
        </div>

        {/* Layout */}
        <div className="account-layout">
          {/* Left Navigation Sidebar */}
          <aside className="account-sidebar">
            <div className="account-profile-summary">
              <div className="account-avatar">
                <User size={24} />
              </div>
              <div className="account-profile-text">
                <h3 className="account-user-name">Patron of Craft</h3>
                <span className="account-membership">Cartiva Collector Member</span>
              </div>
            </div>

            <nav className="account-tabs-list">
              <button
                type="button"
                className={`account-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={17} />
                <span>My Orders</span>
                <span className="tab-badge">{SAMPLE_ORDERS.length}</span>
              </button>

              <button
                type="button"
                className={`account-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={17} />
                <span>Shipping Addresses</span>
              </button>

              <button
                type="button"
                className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <ShieldCheck size={17} />
                <span>Account & Security</span>
              </button>
            </nav>
          </aside>

          {/* Right Main Content Panel */}
          <main className="account-main-panel">
            {activeTab === 'orders' && (
              <div className="account-orders-view">
                <div className="panel-header">
                  <h2 className="panel-title">Your Order History</h2>
                  <p className="panel-subtitle">
                    Track dispatches, review studio provenance, and download GST tax invoices.
                  </p>
                </div>

                <div className="orders-list">
                  {SAMPLE_ORDERS.map((order) => (
                    <div key={order.orderId} className="order-history-card">
                      <div className="order-card-header">
                        <div className="order-id-date">
                          <span className="order-id">{order.orderId}</span>
                          <span className="order-date">Placed on {order.date}</span>
                        </div>
                        <div className="order-status-badge">
                          <CheckCircle2 size={14} />
                          <span>{order.status}</span>
                        </div>
                      </div>

                      <div className="order-items-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <img src={item.image} alt={item.title} className="order-item-thumb" />
                            <div className="order-item-info">
                              <span className="order-item-store">{item.store}</span>
                              <h4 className="order-item-title">{item.title}</h4>
                              <span className="order-item-qty">Qty: {item.quantity}</span>
                            </div>
                            <div className="order-item-price">
                              <span>₹{Number(item.price).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-footer">
                        <div className="order-total-group">
                          <span className="total-label">Order Total:</span>
                          <span className="total-val">₹{Number(order.total).toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-reorder"
                          onClick={onExploreCatalogue}
                        >
                          Explore Studio Catalog
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="account-addresses-view">
                <div className="panel-header">
                  <h2 className="panel-title">Saved Shipping Addresses</h2>
                  <p className="panel-subtitle">Primary destinations for your handcrafted deliveries.</p>
                </div>

                <div className="addresses-grid">
                  <div className="address-card default">
                    <span className="default-pill">Default Delivery Address</span>
                    <h4 className="addr-name">Editorial Resident</h4>
                    <p className="addr-text">
                      Flat 402, Lotus Courtyard, Indiranagar 100ft Road<br />
                      Bengaluru, Karnataka – 560038<br />
                      Phone: +91 98765 43210
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="account-profile-view">
                <div className="panel-header">
                  <h2 className="panel-title">Account & Security</h2>
                  <p className="panel-subtitle">Manage your personal credentials and communication preferences.</p>
                </div>

                <div className="profile-details-card">
                  <div className="profile-row">
                    <span className="row-label">Full Name:</span>
                    <span className="row-val">Patron of Craft</span>
                  </div>
                  <div className="profile-row">
                    <span className="row-label">Email:</span>
                    <span className="row-val">patron@cartiva-studio.com</span>
                  </div>
                  <div className="profile-row">
                    <span className="row-label">Role:</span>
                    <span className="row-val">Verified Customer</span>
                  </div>
                  <div className="profile-row">
                    <span className="row-label">Authentication:</span>
                    <span className="row-val">Protected with JWT & Salting</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
