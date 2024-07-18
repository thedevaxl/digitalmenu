import { useState } from 'react';
import { useRouter } from 'next/router';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert('Login successful');
      router.push('/admin'); // Redirect to the admin page on successful login
    } else {
      alert('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              className="input input-bordered"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              className="input input-bordered"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
