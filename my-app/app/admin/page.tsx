"use client"
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Replace with your actual admin credentials
    const adminEmail = 'admin123@gmail.com';
    const adminPassword = 'admin123';

    if (email === adminEmail && password === adminPassword) {
      // Set a flag in localStorage to indicate the admin is logged in
      localStorage.setItem('isLoggedIn', 'true');
      // Redirect to the admin dashboard
      router.push('/admin/dashboard');
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="p-6 bg-white rounded shadow-md"
      >
        <h2 className="mb-4 text-2xl font-bold">Admin Login</h2>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;