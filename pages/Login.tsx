import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { Input, Button } from '../components/ui';
import { authService } from '../services/mockBackend';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.login(email);
      if (res.success && res.data) {
        if (res.data.requireMfa) {
          // Pass email to OTP page via router state or query param
          navigate(`/verify-otp?email=${encodeURIComponent(email)}&mode=login`);
        } else {
          localStorage.setItem('auth_token', res.data.token);
          localStorage.setItem('current_user', JSON.stringify(res.data.user));
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await authService.googleLogin();
      if (res.success && res.data) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('current_user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <Input 
          label="Email address" 
          type="email" 
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<i className="fa-regular fa-envelope"></i>}
        />

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
          Sign in
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} isLoading={loading}>
            <i className="fa-brands fa-google mr-2 text-red-500"></i>
            Google
          </Button>
        </div>
      </div>
      
      <p className="mt-8 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <button onClick={() => navigate('/signup')} className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </button>
      </p>
    </AuthLayout>
  );
};

export default Login;