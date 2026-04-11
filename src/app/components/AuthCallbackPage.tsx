import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get the returnTo param from the URL before Supabase clears it
      const url = new URL(window.location.href);
      const returnTo = url.searchParams.get('returnTo') || '/';

      // exchangeCodeForSession handles the magic link token in the URL
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        setError(error.message);
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      navigate(returnTo, { replace: true });
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Authentication error: {error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Signing you in...</p>
    </div>
  );
}
