import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { Input, Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
     return (
        <AuthLayout title="Check your email" subtitle="We have sent password reset instructions">
            <div className="text-center">
                 <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl mb-6">
                    <i className="fa-solid fa-envelope-open-text"></i>
                 </div>
                 <p className="text-slate-600 mb-8">
                     We sent an email to <span className="font-semibold text-slate-900">{email}</span> with a link to reset your password.
                 </p>
                 <Button className="w-full" variant="outline" onClick={() => navigate('/')}>
                    Back to Login
                 </Button>
            </div>
        </AuthLayout>
     );
  }

  return (
    <AuthLayout 
      title="Reset password" 
      subtitle="Enter your email to receive reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Email address" 
          type="email" 
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<i className="fa-regular fa-envelope"></i>}
        />
        <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
          Send Reset Link
        </Button>
        <div className="text-center">
             <button type="button" onClick={() => navigate('/')} className="text-sm font-medium text-slate-600 hover:text-slate-800">
                <i className="fa-solid fa-arrow-left mr-2"></i>
                Back to Login
             </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;