"use client";

import { useRouter } from "next/navigation";
import Image from 'next/image';
import './globals.css';

export default function Home() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-3xl font-bold mb-8">Axl Development</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => handleNavigation('/admin')}
          className="btn btn-primary"
        >
          Admin
        </button>
        <button
          onClick={() => handleNavigation('/register')}
          className="btn btn-secondary"
        >
          Register
        </button>
        <button
          onClick={() => handleNavigation('/login')}
          className="btn btn-secondary"
        >
          Login
        </button>
      </div>
    </main>
  );
}
