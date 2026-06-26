import React, { useState } from 'react';
import './MockRazorpay.css';

export default function MockRazorpay({ options, onClose }) {
  const [activeTab, setActiveTab] = useState('netbanking');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBankClick = (bankName) => {
    setProcessing(true);
    // Simulate API delay
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Wait for success animation, then trigger Razorpay handler
      setTimeout(() => {
        options.handler({
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_order_id: options.order_id,
          razorpay_signature: 'mock_signature_12345'
        });
      }, 2500);
    }, 2000);
  };

  if (success) {
    return (
      <div className="mock-rzp-overlay">
        <div className="mock-rzp-modal success-modal">
          <div className="success-animation">
            <div className="checkmark-circle">
              <div className="checkmark-stem"></div>
              <div className="checkmark-kick"></div>
            </div>
          </div>
          <h3>Payment Successful</h3>
          <p>Redirecting to receipt...</p>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="mock-rzp-overlay">
        <div className="mock-rzp-modal processing-modal">
          <div className="mock-rzp-header">
            <span className="mock-rzp-title">Payment Options</span>
            <button className="mock-rzp-close" onClick={onClose}>×</button>
          </div>
          <div className="mock-rzp-processing">
            <h3>Processing your payment</h3>
            <p>This will only take a few seconds.</p>
            <div className="mock-rzp-spinner"></div>
            <button className="mock-rzp-cancel" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-rzp-overlay">
      <div className="mock-rzp-modal">
        <div className="mock-rzp-header">
          <span className="mock-rzp-title">Payment Options</span>
          <div className="mock-rzp-actions">
            <span>...</span>
            <button className="mock-rzp-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="mock-rzp-body">
          <div className="mock-rzp-sidebar">
            <div className={`mock-rzp-tab ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <span>Cards</span>
              <div className="mock-rzp-icons">💳</div>
            </div>
            <div className={`mock-rzp-tab ${activeTab === 'netbanking' ? 'active' : ''}`} onClick={() => setActiveTab('netbanking')}>
              <span>Netbanking</span>
              <div className="mock-rzp-icons">🏦</div>
            </div>
            <div className={`mock-rzp-tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
              <span>Wallet</span>
              <div className="mock-rzp-icons">👛</div>
            </div>
            <div className={`mock-rzp-tab ${activeTab === 'paylater' ? 'active' : ''}`} onClick={() => setActiveTab('paylater')}>
              <span>Pay Later</span>
              <div className="mock-rzp-icons">⏱️</div>
            </div>
          </div>

          <div className="mock-rzp-content">
            {activeTab === 'netbanking' && (
              <>
                <div className="mock-rzp-search">
                  <input type="text" placeholder="Search for Banks" />
                </div>
                <div className="mock-rzp-section-title">Suggested Banks</div>
                <div className="mock-rzp-bank-list">
                  <div className="mock-rzp-bank-item" onClick={() => handleBankClick('Bank of Baroda')}>
                    <div className="bank-logo bob">B</div>
                    <span>Bank of Baroda - Retail Banking</span>
                    <span className="arrow">›</span>
                  </div>
                  <div className="mock-rzp-bank-item highlight" onClick={() => handleBankClick('Canara Bank')}>
                    <div className="bank-logo canara">C</div>
                    <span>Canara Bank</span>
                    <span className="arrow">›</span>
                  </div>
                  <div className="mock-rzp-bank-item" onClick={() => handleBankClick('PNB')}>
                    <div className="bank-logo pnb">P</div>
                    <span>Punjab National Bank - Retail Banking</span>
                    <span className="arrow">›</span>
                  </div>
                  <div className="mock-rzp-bank-item" onClick={() => handleBankClick('IDBI')}>
                    <div className="bank-logo idbi">I</div>
                    <span>IDBI</span>
                    <span className="arrow">›</span>
                  </div>
                </div>
                <div className="mock-rzp-section-title">All Banks</div>
                <div className="mock-rzp-bank-list">
                  <div className="mock-rzp-bank-item" onClick={() => handleBankClick('Airtel')}>
                    <div className="bank-logo airtel">A</div>
                    <span>Airtel Payments Bank</span>
                    <span className="arrow">›</span>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'cards' && (
              <div className="mock-rzp-placeholder" style={{ textAlign: 'center', marginTop: '40px' }}>
                <p style={{ marginBottom: '20px', color: '#666' }}>Enter your card details</p>
                <input type="text" placeholder="Card Number (e.g. 4111 1111...)" style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px' }} defaultValue="4111 1111 1111 1111" />
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                  <input type="text" placeholder="MM/YY" defaultValue="12/26" style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                  <input type="text" placeholder="CVV" defaultValue="123" style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <button 
                  onClick={() => handleBankClick('Card')}
                  style={{ width: '100%', padding: '14px', background: '#3388ff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
                >
                  Pay Now
                </button>
              </div>
            )}
            {activeTab !== 'netbanking' && activeTab !== 'cards' && (
              <div className="mock-rzp-placeholder">
                <p>Please select Cards or Netbanking to proceed.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mock-rzp-footer">
          <span>Secured by <strong>Razorpay</strong></span>
        </div>
      </div>
    </div>
  );
}
