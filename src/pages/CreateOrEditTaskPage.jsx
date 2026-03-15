// src/pages/CreateOrEditTaskPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import CreateOrEditTask from '../components/CreateOrEditTask';
import TopAppBar from '../components/TopAppBar';

export default function CreateOrEditTaskPage() {
  const { _id } = useParams();
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', m: 0, p: 0}}>
      <TopAppBar 
        showHomeButton         
        onHomeClick={() => navigate('/')}
      />
      <Box 
        sx={{ 
          width: '100%', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          p: 2, 
          boxSizing: 'border-box',  
        }}>
        <CreateOrEditTask _id={_id} onSuccess={() => navigate('/', { state: { reload: true } })} />
      </Box>
    </Box>
  );
}