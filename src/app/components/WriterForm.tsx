'use client';
import React, { useState } from 'react';
import S from './figma/WriterForm.module.css';

export default function WriterForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    sample: '',
    publications: '',
    statement: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={S.confirmation}>
        <h2>Application Received</h2>
        <p>Thank you for applying to the Writer pathway. We read every submission carefully and will be in touch.</p>
      </div>
    );
  }

  return (
    <form className={S.form} onSubmit={handleSubmit}>
      <div className={S.intro}>
        <h2>Writer Pathway</h2>
        <p>For prose writers, essayists, and critics seeking publication in Tilth or placement within the Page Gallery ecosystem.</p>
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
        <label htmlFor="bio">Bio <span className={S.hint}>(150 words max)</span></label>
        <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} required rows={4} placeholder="A brief bio" />
      </div>

      <div className={S.field}>
        <label htmlFor="publications">Previous Publications <span className={S.hint}>(optional)</span></label>
        <textarea id="publications" name="publications" value={form.publications} onChange={handleChange} rows={3} placeholder="Where your work has appeared" />
      </div>

      <div className={S.field}>
        <label htmlFor="sample">Writing Sample <span className={S.hint}>(paste up to 1,500 words)</span></label>
        <textarea id="sample" name="sample" value={form.sample} onChange={handleChange} required rows={10} placeholder="Your strongest recent work" />
      </div>

      <div className={S.field}>
        <label htmlFor="statement">Statement of Intent <span className={S.hint}>(why the Garden, why now)</span></label>
        <textarea id="statement" name="statement" value={form.statement} onChange={handleChange} required rows={5} placeholder="What draws you to this community" />
      </div>

      <button type="submit" className={S.submit}>Submit Application</button>
    </form>
  );
}
