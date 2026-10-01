import React, { useState } from 'react';

const NominateForm = ({ awards }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    awardCategory: '',
    description: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Logic for actual submission would go here
  };

  if (submitted) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: 'var(--gold-primary)' }}>Nomination Submitted!</h3>
        <p>Thank you for nominating your business. Our team will review your application shortly.</p>
        <button className="btn-gold" onClick={() => setSubmitted(false)} style={{ marginTop: '1rem' }}>
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel form-container">
      <h3>Nominate Your Business</h3>
      <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        Submit your details below to apply for the MCCIA Annual Awards.
      </p>
      <form onSubmit={handleSubmit} className="nominate-form">
        <div className="form-group">
          <label htmlFor="businessName">Business Name</label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            placeholder="Enter your company name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="contact@company.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="awardCategory">Select Award Category</label>
          <select
            id="awardCategory"
            name="awardCategory"
            value={formData.awardCategory}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select an Award</option>
            {awards.map((award, index) => (
              <option key={index} value={award.title}>
                {award.title} - {award.tag}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Why do you deserve this award?</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe your achievements..."
          ></textarea>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Submit Nomination
        </button>
      </form>
    </div>
  );
};

export default NominateForm;
