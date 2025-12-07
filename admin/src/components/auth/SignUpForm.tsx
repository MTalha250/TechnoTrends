"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { register } from "@/hooks/auth";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import useAuthStore from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken, setUser, setRole: setStoreRole } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "" as "director" | "admin" | "head" | "user" | "",
    department: "" as "accounts" | "technical" | "it" | "sales" | "store" | "",
  });

  const roleOptions = [
    { value: "director", label: "Director" },
    { value: "admin", label: "Admin" },
    { value: "head", label: "Head" },
    { value: "user", label: "Worker" },
  ];

  const departmentOptions = [
    { value: "accounts", label: "Accounts" },
    { value: "technical", label: "Technical" },
    { value: "it", label: "IT" },
    { value: "sales", label: "Sales" },
    { value: "store", label: "Store" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.role === "head" && !formData.department) {
      toast.error("Please select a department");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role as "director" | "admin" | "head" | "user",
        ...(formData.role === "head" && formData.department && { department: formData.department }),
      };

      const data = await register(payload);
      setUser(data.user);
      setToken(data.token);
      setStoreRole(data.user.role);
      toast.success("Account created successfully! Waiting for approval.");
      router.push("/");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Invalid data provided");
      } else if (err.response?.status === 409) {
        toast.error("Email already exists");
      } else {
        toast.error("Something went wrong, please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-8">
        <div>
          <div className="mb-5 sm:mb-6">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your account to get started
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label>
                    Full Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter your full name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>
                    Phone <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter your phone number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>
                    Role <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    options={roleOptions}
                    placeholder="Select your role"
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value as typeof formData.role })}
                  />
                </div>
                {formData.role === "head" && (
                  <div>
                    <Label>
                      Department <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={departmentOptions}
                      placeholder="Select your department"
                      value={formData.department}
                      onChange={(value) => setFormData({ ...formData, department: value as typeof formData.department })}
                    />
                  </div>
                )}
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>
                    Confirm Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button disabled={loading} className="w-full" size="sm">
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{" "}
                  </span>
                  <Link
                    href="/signin"
                    className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
