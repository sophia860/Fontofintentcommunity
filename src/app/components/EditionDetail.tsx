import React from 'react';
import { useParams } from 'react-router';

export function EditionDetail() {
  const { id } = useParams();
  return (
    <main style={{ maxWidth: 720, margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'Georgia, serif' }}>
      <h1 style={{ fontWeight: 400, fontSize: '2rem', marginBottom: '0.5rem' }}>Edition Detail</h1>
      <p style={{ color: '#666', fontStyle: 'italic' }}>This section is in progress.</p>
    </main>
  );
}

export default EditionDetail;
