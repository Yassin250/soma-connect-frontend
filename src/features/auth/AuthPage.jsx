import React, { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <LoginPage onToggleMode={() => setIsLogin(false)} />
      ) : (
        <RegisterPage onToggleMode={() => setIsLogin(true)} />
      )}
    </>
  );
};