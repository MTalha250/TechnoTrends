"use client";
import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { loginBack } from '@/hooks/auth';
import useAuthStore from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setUser, setToken, setRole, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    handleLoginBack();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginBack = async () => {
    // Skip auto-login for auth pages
    const authPages = ['/signin', '/signup', '/forgot-password'];
    if (authPages.some(page => pathname?.startsWith(page))) {
      return;
    }

    try {
      const res = await loginBack();
      if (!res) {
        clearAuth();
        router.push("/signin");
        return;
      }
      console.log(res.user)
      setUser(res.user);
      setToken(res.token);
      setRole(res.role as "director" | "admin" | "head" | "user");
    } catch (error) {
      clearAuth();
      router.push("/signin");
      console.error("Error during login back:", error);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>TechnoTrends Portal</title>
        <meta name="description" content="TechnoTrends Management Portal" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: '',
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
