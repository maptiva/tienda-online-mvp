
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await signIn({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-[#f0f2f5]'>
      <div className='bg-white p-4 shadow-md rounded-sm w-full max-w-[600px] text-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#333]'>Login</h1>
        {error && <p className='text-red-500 text-sm mb-4 font-bold'>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className='mb-5 text-left'>
            <label className='block mb-2 text-[#555] font-bold' htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full p-3 border border-[#ddd] rounded-sm border-sm text-md'
            />
          </div>
          <div className='mb-5 text-left'>
            <label className='block mb-2 text-[#555] font-bold' htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='w-full p-3 border border-[#ddd] rounded-sm border-sm text-md'
            />
          </div>
          <button type="submit" className='w-full p-3 bg-[#007bff] text-white rounded-sm border-none cursor-pointer text-md hover:bg-[#0056b3] transition-all duration-300'>Iniciar Sesion</button>
        </form>
      </div>
    </div>
  );
}
