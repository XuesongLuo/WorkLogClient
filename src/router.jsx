// src/router.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import AuthRoute from './components/AuthRoute';
import Home from './pages/Home';
import TaskDetailPage from './pages/TaskDetailPage'; 
import CreateOrEditTaskPage from './pages/CreateOrEditTaskPage'; 
import ProjectTableEditor from './pages/ProjectTableEditorPage';


const router = createBrowserRouter([
  { path: '/login', element: <Login /> }, 
  { 
    path: '/', 
    element: (
      <AuthRoute>
        <Home />
      </AuthRoute>
    ) 
  },
  { 
    path: '/task/:_id', 
    element: (
      <AuthRoute>
        <TaskDetailPage />
      </AuthRoute>
    )
  },
  { 
    path: '/task/new', 
    element: (
      <AuthRoute>
        <CreateOrEditTaskPage />
      </AuthRoute>
    )
  },
  { 
    path: '/task/edit/:_id', 
    element: (
      <AuthRoute>
        <CreateOrEditTaskPage />
      </AuthRoute>
    )
  },
  { 
    path: '/project-table', 
    element: (
      <AuthRoute>
        <ProjectTableEditor />
      </AuthRoute>
    )
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}