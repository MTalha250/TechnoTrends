"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { login } from "@/hooks/auth";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import useAuthStore from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUser, setRole: setStoreRole } = useAuthStore();
  const router = useRouter();

  const roleOptions = [
    { value: "director", label: "Director" },
    { value: "admin", label: "Admin" },
    { value: "head", label: "Head" },
    { value: "user", label: "Worker" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password, role);
      setUser(data.user);
      setToken(data.token);
      setStoreRole(data.role);
      toast.success("Logged in successfully");
      router.push("/");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 404) {
        toast.error("User not found");
      } else if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Invalid credentials or unauthorized");
      } else if (err.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Something went wrong, please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-5">
                <div>
                  <Label>
                    Role <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    options={roleOptions}
                    placeholder="Select your role"
                    value={role}
                    onChange={(value) => setRole(value)}
                  />
                </div>
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div>
                  <Button disabled={loading} className="w-full text-white" size="sm">
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Don&apos;t have an account?{" "}
                  </span>
                  <Link
                    href="/signup"
                    className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400"
                  >
                    Sign Up
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
