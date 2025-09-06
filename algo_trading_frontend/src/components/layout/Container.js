import React from 'react';

// PUBLIC_INTERFACE
export default function Container({ children }) {
  /** Constrains page content to a max width and adds padding. */
  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      {children}
    </main>
  );
}
