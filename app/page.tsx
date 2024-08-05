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
    <main   data-theme="warmCozy"  className="flex flex-col min-h-screen">
      <nav className="container mx-auto p-4 flex justify-between">
        <ul className="flex items-center">
          <li className="text-lg font-bold">Digital Menu Creation</li>
        </ul>
        <ul className="flex space-x-4">
          <li>
            <button onClick={() => handleNavigation('#features')} className="btn btn-link">Features</button>
          </li>
          <li>
            <button onClick={() => handleNavigation('#how-it-works')} className="btn btn-link">How It Works</button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/register')} className="btn btn-primary">Join Now</button>
          </li>
          <li>
            <button onClick={() => handleNavigation('/login')} className="btn btn-primary">Login</button>
          </li>
        </ul>
      </nav>

      <section className="container mx-auto text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Create Your Digital Menu Effortlessly</h1>
        <p className="mb-8">Join our platform and start offering a seamless ordering experience to your customers.</p>
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
          alt="Restaurant Digital Menu"
          className="mx-auto mb-4"
          width={800}
          height={450}
          style={{ objectFit: 'cover' }}
        />
        <p className="text-sm">Image from <a href="https://unsplash.com/" target="_blank" className="text-blue-500">Unsplash</a></p>
      </section>

      <section id="features" className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <ul className="list-disc pl-6 mb-8">
          <li>Easy-to-use menu builder</li>
          <li>Customizable designs</li>
          <li>Order tracking and saving</li>
          <li>Integration with popular payment gateways</li>
          <li>Real-time updates to your menu</li>
        </ul>
        <Image
          src="https://images.unsplash.com/photo-1599250300435-b9693f21830d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Digital Menu Features"
          className="mx-auto mb-4"
          width={800}
          height={450}
          style={{ objectFit: 'cover' }}
        />
        <p className="text-sm">Image from <a href="https://unsplash.com/" target="_blank" className="text-blue-500">Unsplash</a></p>
      </section>

      <section id="how-it-works" className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <ol className="list-decimal pl-6 mb-8">
          <li>Register your restaurant account.</li>
          <li>Create and customize your digital menu.</li>
          <li>Start receiving orders directly through your digital menu.</li>
        </ol>
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
          alt="How It Works"
          className="mx-auto mb-4"
          width={800}
          height={450}
          style={{ objectFit: 'cover' }}
        />
        <p className="text-sm">Image from <a href="https://unsplash.com/" target="_blank" className="text-blue-500">Unsplash</a></p>
      </section>

      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-4">What Our Users Say</h2>
        <blockquote className="mb-8">
          <p className="italic">&quot;The digital menu creation tool is a game-changer for our restaurant. It&apos;s easy to use, and our customers love the convenience!&quot;</p>
          <footer className="text-right">- Satisfied Restaurant Owner</footer>
        </blockquote>
        <blockquote>
          <p className="italic">&quot;We saw an increase in customer satisfaction after switching to the digital menu. It&apos;s intuitive and efficient.&quot;</p>
          <footer className="text-right">- Happy Restaurant Manager</footer>
        </blockquote>
      </section>

      {/* <section id="register" className="container mx-auto py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join Us Today</h2>
          <p className="mb-8">Create your digital menu and start taking orders in minutes.</p>
          <form className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            <input type="text" id="restaurantname" name="restaurantname" placeholder="Restaurant Name" className="input input-bordered" required />
            <input type="email" id="email" name="email" placeholder="Email" className="input input-bordered" required />
            <button type="submit" onClick={(e) => { e.preventDefault(); handleNavigation('/register'); }} className="btn btn-primary block">Register Now</button>
          </form>
        </div>
      </section> */}

      <footer className="container mx-auto py-4 text-center text-sm">
        <a href="#" className="text-blue-500">Privacy Policy</a> • <a href="#" className="text-blue-500">Terms of Service</a>
      </footer>
    </main>
  );
}
