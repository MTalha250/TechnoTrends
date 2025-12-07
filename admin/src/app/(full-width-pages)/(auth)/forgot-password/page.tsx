"use client";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ForgotPassword() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (user) return null;
  return <ForgotPasswordForm />;
}
