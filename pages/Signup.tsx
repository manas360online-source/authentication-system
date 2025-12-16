import React, { useState, useMemo } from 'react';
import { AuthLayout } from './AuthLayout';
import { Input, Button } from '../components/ui';
import { authService } from '../services/mockBackend';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-500' };

    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score < 3) return { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 3) return { score: 2, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
    return { score: 4, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' };
  }, [formData.password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register(formData.email, formData.password, formData.fullName, formData.phone);
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
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Password" 
            type="password" 
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
           <Input 
            label="Confirm" 
            type="password" 
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-1 space-y-1">
            <div className="flex gap-1 h-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level} 
                  className={`flex-1 rounded-full transition-colors duration-300 ${
                    passwordStrength.score >= level ? passwordStrength.color : 'bg-slate-200'
                  }`} 
                />
              ))}
            </div>
            <div className="flex justify-end">
               <span className={`text-xs font-medium ${passwordStrength.textColor}`}>
                 {passwordStrength.label}
               </span>
            </div>
          </div>
        )}

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