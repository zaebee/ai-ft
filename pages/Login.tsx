import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import { Token } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../constants';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // The API requires form data for OAuth2
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await ApiService.post<Token>('/auth/access-token', formData, true);
      
      await login(response);
      
      // Determine redirect based on user role (fetched in AuthProvider) or default to Home
      // For now, simple redirect
      navigate(ROUTES.HOME);
    } catch (err: any) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.message) {
         try {
             const parsed = JSON.parse(err.message);
             if (parsed.detail) errorMessage = Array.isArray(parsed.detail) ? parsed.detail[0].msg : parsed.detail;
         } catch {
             // raw error
         }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">Sign in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Sign in
          </Button>
          
          <div className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <span className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
