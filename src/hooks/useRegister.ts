import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/axios";
import { useAuth } from "./useAuth";
import { useToast } from "../context/ToastContext";
import { registerSchema } from "../schemas/authSchemas";
import { getErrorMessage } from "../utils/errorMessage";

interface RegisterFormState {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  age: string;
}

export const useRegister = () => {
  const [formData, setFormData] = useState<RegisterFormState>({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    age: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [id]: value,
    }));

  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? "Please check the form.", "error");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword: _confirmPassword, ...payload } = result.data;
      const response = await api.post("/auth/signup", payload);

      login(response.data.user);

      showToast("Account created successfully.", "success");

      navigate("/dashboard");
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to create your account. Please try again."), "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    loading,
    handleRegister,
  };
};