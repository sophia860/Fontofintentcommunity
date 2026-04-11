'use client';
import React, { useState } from 'react';
import S from './figma/JournalForm.module.css';
import { supabase } from '../lib/supabase';

export default function JournalForm() {
  const [form, setForm] = useState({
    journalName: '',
    website: '',
    contactName: '',
    email: '',
    focus: '',
    audience: '',
    galleryUse: '',
    proposal: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('journal_applications').insert({
      journal_name: form.journalName,
      contact_name: form.contactName,
      email: form.email,
      mission_statement: form.focus + '\n\n' + form.proposal,
      status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={S.confirmation}>
        <h2>Proposal Received</h2>
        <p>Thank you for your journal&apos;s interest in the Page Gallery. We will review your proposal and follow up within two weeks.</p>
      </div>
    );
  }

  return (
    <form className={S.form} onSubmit={handleSubmit}>
      <div className={S.intro}>
        <h2>Journal Pathway</h2>
        <p>Journals and literary magazines use the Page Gallery to sell editions, fund operations, and reach new readers. This pathway is for editors seeking to join the ecosystem.</p>
      </div>

      {error && <p style={{ color: '#9b2335', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</p>}

      <div className={S.field}>
        <label htmlFor="journalName">Journal Name</label>
        <input id="journalName" name="journalName" type="text" value={form.journalName} onChange={handleChange} required placeholder="Name of your publication" />
      </div>

      <div className={S.field}>
        <label htmlFor="website">Website <span className={S.hint}>(optional)</span></label>
        <input id="website" name="website" type="url" value={form.website} onChange={handleChange} placeholder="https://" />
      </div>

      <div className={S.field}>
        <label htmlFor="contactName">Editor or Contact Name</label>
        <input id="contactName" name="contactName" type="text" value={form.contactName} onChange={handleChange} required placeholder="Your name" />
      </div>

      <div className={S.field}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
      </div>

      <div className={S.field}>
        <label htmlFor="focus">Editorial Focus</label>
        <textarea id="focus" name="focus" value={form.focus} onChange={handleChange} required rows={4} placeholder="What your journal publishes and why" />
      </div>

      <div className={S.field}>
        <label htmlFor="audience">Readership &amp; Reach</label>
        <textarea id="audience" name="audience" value={form.audience} onChange={handleChange} required rows={3} placeholder="Who reads your journal and how you distribute" />
      </div>

      <div className={S.field}>
        <label htmlFor="galleryUse">How You Plan to Use the Gallery</label>
        <textarea id="galleryUse" name="galleryUse" value={form.galleryUse} onChange={handleChange} required rows={4} placeholder="Editions, prints, subscriptions, or other offerings" />
      </div>

      <div className={S.field}>
        <label htmlFor="proposal">Partnership Proposal <span className={S.hint}>(what you bring, what you need)</span></label>
        <textarea id="proposal" name="proposal" value={form.proposal} onChange={handleChange} required rows={5} placeholder="Your vision for collaboration" />
      </div>

      <button type="submit" className={S.submit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Proposal'}
      </button>
    </form>
  );
}
