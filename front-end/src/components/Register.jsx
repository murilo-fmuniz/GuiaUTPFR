import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { registerUser, setToken } from '../api';

const Register = ({ onRegister, onBackToLogin, isModal = false }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !email || !senha || !confirmSenha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (senha !== confirmSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setError('');

    try {
      await registerUser(username, email, senha);
      // Após registrar com sucesso, fazer login automático
      const loginModule = await import('../api');
      const { loginUser } = loginModule;
      const loginData = await loginUser(username, senha);
      setToken(loginData.access_token);
      onRegister({ username, email, token: loginData.access_token });
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
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
  const linkClass = theme === 'dark' ? 'text-yellow-400 hover:underline' : 'text-yellow-600 hover:underline';

  // Se for modal, retorna apenas o formulário compacto
  if (isModal) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <h3 className={`text-xl font-bold ${textClass} mb-4`}>Criar Conta</h3>
        
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

        <div className="mb-3">
          <label className={`block text-xs font-semibold ${labelClass} mb-1`}>
            E-mail
          </label>
          <input
            type="email"
            placeholder="seu.email@exemplo.com"
            className={`w-full border rounded px-3 py-2 text-sm ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-yellow-400 transition`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
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

        <div className="mb-4">
          <label className={`block text-xs font-semibold ${labelClass} mb-1`}>
            Confirmar Senha
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full border rounded px-3 py-2 text-sm ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-yellow-400 transition`}
            value={confirmSenha}
            onChange={e => setConfirmSenha(e.target.value)}
            required
          />
        </div>

        <div className={`mb-3 p-2 rounded text-xs ${theme === 'dark' ? 'bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
          <p className="font-semibold mb-1">🔒 Privacidade</p>
          <p>Seus dados são utilizados apenas para registro e autenticação. Nenhuma informação é compartilhada com terceiros.</p>
        </div>

        <button
          type="submit"
          className={`w-full ${buttonClass} font-semibold py-2 rounded text-sm transition duration-200 mb-3`}
        >
          Criar Conta
        </button>

        <p className={`text-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Já tem conta?{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className={`${linkClass} font-semibold cursor-pointer transition`}
          >
            Voltar para login
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
          <h2 className={`text-2xl sm:text-3xl font-bold ${textClass} mb-2`}>Criar Conta</h2>
          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Registre-se para salvar suas conversas
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

          <div className="mb-4">
            <label className={`block text-sm font-semibold ${labelClass} mb-2`}>
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu.email@exemplo.com"
              className={`w-full border rounded-lg px-4 py-2 sm:py-3 text-sm ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
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

          <div className="mb-6">
            <label className={`block text-sm font-semibold ${labelClass} mb-2`}>
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full border rounded-lg px-4 py-2 sm:py-3 text-sm ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition`}
              value={confirmSenha}
              onChange={e => setConfirmSenha(e.target.value)}
              required
            />
          </div>

          <div className={`mb-6 p-4 rounded-lg text-sm ${theme === 'dark' ? 'bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
            <p className="font-semibold mb-2">🔒 Aviso de Privacidade</p>
            <p>Seus dados pessoais são utilizados exclusivamente como meio de registro e autenticação no sistema. Nenhuma informação é compartilhada com terceiros ou utilizada para outros fins.</p>
          </div>

          <button
            type="submit"
            className={`w-full ${buttonClass} font-semibold py-2 sm:py-3 rounded-lg transition duration-200 text-sm mb-4`}
          >
            Criar Conta
          </button>
        </form>

        <p className={`text-center text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Já tem conta?{' '}
          <button
            onClick={onBackToLogin}
            className={`${linkClass} font-semibold cursor-pointer transition`}
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
