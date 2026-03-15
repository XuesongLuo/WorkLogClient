// src/components/AuthRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../utils/authUtils';



export default function AuthRoute({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    // 未登录则重定向到登录页，保留原路由
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}