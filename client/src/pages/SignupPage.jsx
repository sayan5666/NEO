import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const getClientId = () => {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        // @ts-ignore
        return import.meta.env.VITE_GOOGLE_CLIENT_ID;
      }
    } catch(e) {}
    try {
      if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      }
    } catch(e) {}
    return '';
  };
  const googleClientId = getClientId();
  console.log('CLIENT ID IS:', googleClientId);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGoogleCallback = async (response) => {
      if (response && response.credential) {
        setGoogleLoading(true);
        setError('');
        try {
          await googleLogin(response.credential);
          navigate('/dashboard');
        } catch (err) {
          setError(err.response?.data?.message || 'Google signup failed');
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    const initGoogle = () => {
      if (window.google?.accounts?.id && googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            text: 'signup_with',
            logo_alignment: 'center',
            width: 320,
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(intervalId);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, [googleClientId, googleLogin, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#FFFDF5]">
      <Link
        to="/"
        className="font-headline text-4xl font-black uppercase mb-8 tracking-tighter hover:text-primary transition-colors"
      >
        NEO_INTV
      </Link>

      <div className="w-full max-w-md bg-surface neo-border neo-shadow p-8 relative">
        <div className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 font-mono text-xs font-bold border-[2px] border-on-surface inline-block mb-3">
          NODE_PROVISIONING // NEW_USER
        </div>

        <h1 className="font-headline text-3xl font-black uppercase mb-2">CREATE_ACCOUNT</h1>
        <p className="font-mono text-xs text-on-surface-variant mb-6">
          {'// INITIALIZE CANDIDATE IDENTITY FOR MULTI-AGENT DRILLS'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-error text-on-error font-mono text-xs neo-border">
            {error}
          </div>
        )}

        {/* Neo-Brutalist Google Sign-Up Container */}
        <div className="mb-6">
          {googleClientId ? (
            <div className="w-full flex justify-center border-[3px] border-[#1b1b1b] neo-shadow bg-[#ffffff] p-1">
              <div ref={googleBtnRef} className="w-full flex justify-center [&>div]:w-full"></div>
            </div>
          ) : (
            <div className="w-full py-3 px-4 bg-[#ffcccc] text-[#1b1b1b] border-[3px] border-[#1b1b1b] font-mono text-xs font-bold text-center">
              DEV WARNING: VITE_GOOGLE_CLIENT_ID NOT SET
            </div>
          )}

          <div className="flex items-center my-5">
            <div className="flex-1 h-[2px] bg-[#1b1b1b]"></div>
            <span className="px-3 font-mono text-[11px] font-bold text-[#4d4633] uppercase">
              OR REGISTER WITH EMAIL
            </span>
            <div className="flex-1 h-[2px] bg-[#1b1b1b]"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-1.5">
              HANDLE / NAME:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CYBER_PUNK_01"
              className="w-full p-3 neo-border bg-background font-mono text-sm focus:bg-primary-container focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-1.5">
              EMAIL_ADDRESS:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@neo.intv"
              className="w-full p-3 neo-border bg-background font-mono text-sm focus:bg-primary-container focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-1.5">
              PASSWORD:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3 neo-border bg-background font-mono text-sm focus:bg-primary-container focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full py-3.5 mt-2 text-base tracking-wide"
          >
            {loading ? 'INITIALIZING...' : 'INITIALIZE PROFILE →'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t-[3px] border-on-surface text-center">
          <p className="font-mono text-xs text-on-surface-variant">
            ALREADY REGISTERED?{' '}
            <Link
              to="/login"
              className="text-on-surface font-bold underline decoration-[2px] hover:text-primary"
            >
              ACCESS_LOGIN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
