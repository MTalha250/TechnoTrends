"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { forgotPassword, verifyResetCode } from "@/hooks/auth";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

type Step = "email" | "verify" | "success";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Verification code sent to your email");
      setStep("verify");
      setCountdown(60);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 404) {
        toast.error("Email not found");
      } else {
        toast.error("Failed to send code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Verification code resent");
      setCountdown(60);
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await verifyResetCode(email, code, newPassword);
      toast.success("Password reset successfully!");
      setStep("success");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Invalid or expired code");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Password Reset Successful
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Button className="w-full" size="sm" onClick={() => router.push("/signin")}>
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {step === "email" ? "Forgot Password" : "Reset Password"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === "email"
                ? "Enter your email to receive a verification code"
                : "Enter the code sent to your email and set a new password"}
            </p>
          </div>
          <div>
            {step === "email" ? (
              <form onSubmit={handleSendCode}>
                <div className="space-y-5">
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
                    <Button disabled={loading} className="w-full text-white" size="sm">
                      {loading ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </div>
                  <div className="text-center">
                    <Link
                      href="/signin"
                      className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndReset}>
                <div className="space-y-5">
                  <div>
                    <Label>
                      Verification Code <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter 6-digit code"
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Code sent to {email}
                      </span>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={countdown > 0 || loading}
                        className={`text-xs ${
                          countdown > 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-primary-500 hover:text-primary-600 cursor-pointer"
                        }`}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>
                      New Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <div>
                    <Button disabled={loading} className="w-full text-white" size="sm">
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
                    >
                      Use different email
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
