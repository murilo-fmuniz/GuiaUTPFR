import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { setToken, loginUser } from '../api';

const Login = ({ onLogin, isModal = false }) => {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !senha) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(username, senha);
      setLoading(false);
      // Armazenar token no localStorage
      setToken(data.access_token);
      onLogin({ username, email: username, token: data.access_token });
    } catch (err) {
      setError(err.message || 'Erro ao conectar com o servidor');
      setLoading(false);
    }
  };

  const formBgClass = theme === 'dark'
    ? 'bg-[#2A2B2C]'
    : 'bg-white';
  
  const textClass = theme === 'dark' ? 'text-[#E3E3E3]' : 'text-black';
  const inputBgClass = theme === 'dark'
    ? 'bg-[#1E1F20] text-[#E3E3E3] border-[#3A3B3C] focus:border-yellow-500'
    : 'bg-gray-50 text-black border-gray-300 focus:border-yellow-500';
  const buttonClass = theme === 'dark'
    ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
    : 'bg-yellow-500 hover:bg-yellow-600 text-black';
  const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

  // Se for modal, retorna apenas o formulário compacto
  if (isModal) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <h3 className={`text-xl font-bold ${textClass} mb-4`}>Fazer Login</h3>
        
        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-xs">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label className={`block text-xs font-semibold ${labelClass} mb-1`}>
            Usuário
          </label>
          <input
            type="text"
            placeholder="seu_usuario"
            className={`w-full border rounded px-3 py-2 text-sm ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-yellow-400 transition`}
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className={`block text-xs font-semibold ${labelClass} mb-1`}>
            Senha
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full border rounded px-3 py-2 text-sm ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-yellow-400 transition`}
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${buttonClass} font-semibold py-2 rounded text-sm transition duration-200 mb-2 disabled:opacity-50`}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className={`text-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Não tem conta?{' '}
          <button
            type="button"
            onClick={() => onLogin && onLogin({ action: 'register' })}
            className={`${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} font-semibold cursor-pointer hover:underline transition`}
          >
            Cadastre-se
          </button>
        </p>
      </form>
    );
  }

  // Tela completa (quando chamado diretamente)
  const bgClass = theme === 'dark'
    ? 'bg-[#1E1F20]'
    : 'bg-gradient-to-br from-yellow-300 to-yellow-400';

  return (
    <div className={`flex items-center justify-center min-h-screen ${bgClass} p-4`}>
      <div className={`${formBgClass} p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm`}>
        <div className="mb-6 text-center">
          <h2 className={`text-2xl sm:text-3xl font-bold ${textClass} mb-2`}>Bem-vindo</h2>
          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Faça login para salvar suas conversas
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block text-sm font-semibold ${labelClass} mb-2`}>
              Usuário
            </label>
            <input
              type="text"
              placeholder="seu_usuario"
              className={`w-full border rounded-lg px-4 py-2 sm:py-3 text-sm ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition`}
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-semibold ${labelClass} mb-2`}>
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full border rounded-lg px-4 py-2 sm:py-3 text-sm ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition`}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${buttonClass} font-semibold py-2 sm:py-3 rounded-lg transition duration-200 text-sm disabled:opacity-50`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {!isModal && (
          <p className={`text-center text-xs sm:text-sm mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Não tem conta?{' '}
            <button
              type="button"
              onClick={() => onLogin && onLogin({ action: 'register' })}
              className={`${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} font-semibold cursor-pointer hover:underline transition`}
            >
              Cadastre-se
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;