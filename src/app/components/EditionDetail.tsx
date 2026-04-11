import React from 'react';
import { useParams } from 'react-router';

export function EditionDetail() {
  const { id } = useParams();
  return (
    <main style={{ maxWidth: 720, margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'Georgia, serif' }}>
      <h1 style={{ fontWeight: 600, fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', marginBottom: '0.5rem', lineHeight: 1.1, fontFamily: "'Caveat', cursive" }}>Edition Detail</h1>
      <p style={{ color: '#666', fontStyle: 'italic' }}>This section is in progress.</p>
    </main>
  );
}

export default EditionDetail;
