import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { Input, Button } from '../components/ui';
import { authService } from '../services/mockBackend';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);

    try {
      // Password removed from call
      const res = await authService.register(formData.email, formData.fullName, formData.phone);
      if (res.success) {
        // Redirect to OTP verification
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}&mode=signup`);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create account" 
      subtitle="Start your 30-day free trial today"
    >
      <form onSubmit={handleSignup} className="space-y-4">
        <Input 
          label="Full Name" 
          name="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <Input 
          label="Email address" 
          type="email" 
          name="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input 
          label="Phone Number (Optional)" 
          type="tel" 
          name="phone"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={handleChange}
        />

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button onClick={() => navigate('/')} className="font-medium text-blue-600 hover:text-blue-500">
          Log in
        </button>
      </p>
    </AuthLayout>
  );
};

export default Signup;