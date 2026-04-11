'use client';
import React, { useState } from 'react';
import S from './figma/ResidencyForm.module.css';
import { supabase } from '../lib/supabase';

export default function ResidencyForm() {
  const [form, setForm] = useState({
    name: '', email: '', location: '', bio: '', project: '', duration: '', needs: '', statement: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await supabase.from('residency_applications').insert({
      name: form.name, email: form.email, bio: form.bio, project: form.project,
      duration: form.duration, needs: form.needs, statement: form.statement, status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={S.confirmation}>
        <h2>Application Received</h2>
        <p>Thank you for applying to the Garden Residency. We review applications on a rolling basis and will reach out within three weeks.</p>
      </div>
    );
  }

  return (
    <form className={S.form} onSubmit={handleSubmit}>
      <div className={S.intro}>
        <h2>Residency Pathway</h2>
        <p>For writers, editors, and artists seeking dedicated time and community within the Garden. Residents contribute to the ecosystem while pursuing their own work.</p>
      </div>

      {error && <p style={{ color: '#9b2335', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</p>}

      <div className={S.field}>
        <label htmlFor="name">Full Name</label>
        <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Your name" />
      </div>

      <div className={S.field}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
      </div>

      <div className={S.field}>
        <label htmlFor="location">Current Location</label>
        <input id="location" name="location" type="text" value={form.location} onChange={handleChange} required placeholder="City, Country" />
      </div>

      <div className={S.field}>
        <label htmlFor="bio">Bio <span className={S.hint}>(200 words max)</span></label>
        <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} required rows={4} placeholder="Who you are and what you make" />
      </div>

      <div className={S.field}>
        <label htmlFor="project">Project Proposal</label>
        <textarea id="project" name="project" value={form.project} onChange={handleChange} required rows={6} placeholder="What you intend to work on during the residency" />
      </div>

      <div className={S.field}>
        <label htmlFor="duration">Preferred Duration</label>
        <select id="duration" name="duration" value={form.duration} onChange={handleChange} required>
          <option value="">Select a duration</option>
          <option value="1 month">1 month</option>
          <option value="3 months">3 months</option>
          <option value="6 months">6 months</option>
          <option value="Open">Open to discussion</option>
        </select>
      </div>

      <div className={S.field}>
        <label htmlFor="needs">Support Needs <span className={S.hint}>(space, funding, mentorship, etc.)</span></label>
        <textarea id="needs" name="needs" value={form.needs} onChange={handleChange} required rows={3} placeholder="What would make this residency possible for you" />
      </div>

      <div className={S.field}>
        <label htmlFor="statement">Why the Garden <span className={S.hint}>(why this community, why now)</span></label>
        <textarea id="statement" name="statement" value={form.statement} onChange={handleChange} required rows={4} placeholder="What you hope to give and receive" />
      </div>

      <button type="submit" className={S.submit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
