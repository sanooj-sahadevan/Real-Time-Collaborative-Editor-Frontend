import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { useRegister } from "../hooks/useRegister";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { AuthLayout } from "../components/AuthLayout";

const Register: React.FC = () => {
  const {
    formData,
    handleChange,
    loading,
    handleRegister,
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join us today to get started"
    >
      <form onSubmit={handleRegister}>
        {/* Username + Email */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Username"
            id="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
          />

          <Input
            label="Email"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
          />
        </div>

        {/* Phone + Age */}
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Phone Number"
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
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
          />
        </div>

        {/* Password */}
        <div className="mt-2">
          <Input
            label="Password"
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Strong Password"
            onCopy={(event) => event.preventDefault()}
            onPaste={(event) => event.preventDefault()}
            onCut={(event) => event.preventDefault()}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
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
        </div>

        {/* Confirm Password */}
        <div className="mt-2">
          <Input
            label="Confirm Password"
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            onCopy={(event) => event.preventDefault()}
            onPaste={(event) => event.preventDefault()}
            onCut={(event) => event.preventDefault()}
            endAdornment={
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="flex items-center justify-center text-[#7b8385] transition-colors hover:text-[#263238]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />
        </div>

        {/* Submit */}
        <div className="mt-8">
          <Button type="submit" loading={loading}>
            Create Account
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[#7b8385]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#b45f00] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;