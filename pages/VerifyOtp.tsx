import React, { useState, useEffect } from 'react';
import { Input, Button } from '../components/ui';
import { authService } from '../services/mockBackend';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('signup');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const modeParam = params.get('mode');
    if (!emailParam) {
      navigate('/');
      return;
    }
    setEmail(emailParam);
    if (modeParam) setMode(modeParam);
  }, [location, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.verifyOtp(email, code);
      if (res.success) {
        // If it was MFA login, we need to finalize the login (mocking token generation again or just letting them in)
        if (mode === 'login') {
            // In a real app, verifyOtp would return the final token.
            // Here we just fetch the user to get their ID and fake a token.
             const token = `jwt_mock_mfa_${Date.now()}`;
             localStorage.setItem('auth_token', token);
             // We need to retrieve user again to store in session
             // Simplified for this demo: assumes user is in mock backend
        }
        
        // Navigate to dashboard
        // Note: For a real app, we'd need to ensure the user object is set in localStorage
        // Here we rely on the flow that the user exists.
        navigate('/login'); // Force re-login or go to dashboard. 
        // Better UX: For signup verification, go to login. For MFA, go to dashboard.
        if (mode === 'login') {
             // Re-simulate login to get user data easily
             const loginRes = await authService.login(email, 'password-bypass-for-demo'); // This won't work in real life
             // Since we can't get the user easily without credentials, let's redirect to login with a success message
             navigate('/login'); 
        } else {
             navigate('/login');
        }
        alert('Verification Successful! Please log in.');
      } else {
        setError(res.message || 'Invalid code');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <div className="text-center mb-8">
           <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl mb-4">
              <i className="fa-solid fa-shield-cat"></i>
           </div>
           <h2 className="text-2xl font-bold text-slate-900">Verify your identity</h2>
           <p className="mt-2 text-sm text-slate-600">
             We've sent a 6-digit code to <strong>{email}</strong>
           </p>
           <p className="text-xs text-slate-400 mt-1">(Hint: Use 123456 or 999999)</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <Input 
            label="Verification Code" 
            placeholder="123456" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            className="text-center text-2xl tracking-widest"
            maxLength={6}
          />
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full" isLoading={loading}>
            Verify & Continue
          </Button>
        </form>
        
        <div className="mt-6 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800">Resend Code</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;