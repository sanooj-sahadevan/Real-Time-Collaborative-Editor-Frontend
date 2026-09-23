import React from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AuthLayout } from '../components/AuthLayout';
import { Alert } from '@mui/material';

const Register: React.FC = () => {
  const { formData, handleChange, error, loading, handleRegister } = useRegister();

  return (
    <AuthLayout title="Create Account" subtitle="Join us today to get started">
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <form onSubmit={handleRegister}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Username"
            id="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
          <Input
            label="Email"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Input
            label="Phone Number"
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
          />
          <Input
            label="Age"
            id="age"
            type="number"
            min="1"
            max="100"
            value={formData.age}
            onChange={handleChange}
            placeholder="Age"
            required
          />
        </div>

        <div className="mt-2">
          <Input
            label="Password"
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Strong Password"
            required
          />
        </div>

        <div className="mt-8">
          <Button type="submit" loading={loading}>
            Create Account
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[#7b8385]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#b45f00] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
