import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { useLogin } from "../hooks/useLogin";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { AuthLayout } from "../components/AuthLayout";

const Login: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((previous) => !previous);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <form onSubmit={handleLogin}>
        <Input
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
        />

        <Input
          label="Password"
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          endAdornment={
            <button
              type="button"
              onClick={handleTogglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex items-center justify-center text-[#7b8385] transition-colors hover:text-[#263238]"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />

        <div className="mt-8">
          <Button type="submit" loading={loading}>
            Sign In
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[#7b8385]">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-[#b45f00] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;