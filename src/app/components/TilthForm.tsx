'use client';
import React, { useState } from 'react';
import S from './figma/TilthForm.module.css';

export default function TilthForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    genre: '',
    sample: '',
    previousWork: '',
    whyTilth: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={S.confirmation}>
        <h2>Submission Received</h2>
        <p>Tilth reads every submission with full attention. We publish rarely and only when the work demands it. You will hear from us.</p>
      </div>
    );
  }

  return (
    <form className={S.form} onSubmit={handleSubmit}>
      <div className={S.intro}>
        <h2>Tilth</h2>
        <p>Tilth is not a general submission pool. It is the mark of work that has been prepared — turned over, made ready. We accept prose, criticism, and hybrid forms of uncommon quality. Submit only what you believe is finished.</p>
      </div>

      <div className={S.field}>
        <label htmlFor="name">Full Name</label>
        <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Your name" />
      </div>

      <div className={S.field}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
      </div>

      <div className={S.field}>
        <label htmlFor="bio">Bio <span className={S.hint}>(100 words max)</span></label>
        <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} required rows={3} placeholder="Brief, honest" />
      </div>

      <div className={S.field}>
        <label htmlFor="genre">Form / Genre</label>
        <select id="genre" name="genre" value={form.genre} onChange={handleChange} required>
          <option value="">Select a form</option>
          <option value="Essay">Essay</option>
          <option value="Prose">Prose / Fiction</option>
          <option value="Criticism">Criticism</option>
          <option value="Hybrid">Hybrid / Experimental</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className={S.field}>
        <label htmlFor="previousWork">Where Your Work Has Appeared <span className={S.hint}>(optional)</span></label>
        <textarea id="previousWork" name="previousWork" value={form.previousWork} onChange={handleChange} rows={3} placeholder="Publications, journals, or platforms" />
      </div>

      <div className={S.field}>
        <label htmlFor="sample">The Work <span className={S.hint}>(up to 3,000 words — paste the piece itself)</span></label>
        <textarea id="sample" name="sample" value={form.sample} onChange={handleChange} required rows={14} placeholder="Submit only what is complete" />
      </div>

      <div className={S.field}>
        <label htmlFor="whyTilth">Why Tilth <span className={S.hint}>(optional, but valued)</span></label>
        <textarea id="whyTilth" name="whyTilth" value={form.whyTilth} onChange={handleChange} rows={4} placeholder="What brings you here specifically" />
      </div>

      <button type="submit" className={S.submit}>Submit to Tilth</button>
    </form>
  );
}
