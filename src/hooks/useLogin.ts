import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/axios";
import { useAuth } from "./useAuth";
import { useToast } from "../context/ToastContext";
import { loginSchema } from "../schemas/authSchemas";
import { getErrorMessage } from "../utils/errorMessage";

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? "Please check the form.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", result.data);
      login(res.data.user);
      showToast("Welcome back.", "success");
      navigate("/dashboard");
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to sign in. Please try again."), "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
  };
};
