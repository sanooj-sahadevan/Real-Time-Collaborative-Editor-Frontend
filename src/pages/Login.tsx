import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthLayout } from '../components/AuthLayout';
import { Alert } from '@mui/material';

const Login: React.FC = () => {
  const { email, setEmail, password, setPassword, error, loading, handleLogin } = useLogin();

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <form onSubmit={handleLogin}>
        <Input
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <Input
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <div className="mt-8">
          <Button type="submit" loading={loading}>
            Sign In
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[#7b8385]">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-[#b45f00] hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
