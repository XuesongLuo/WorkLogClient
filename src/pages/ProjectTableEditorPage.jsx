import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import TopAppBar from '../components/TopAppBar';
import ProjectTableEditor from '../components/ProjectTableEditor';

export default function EditPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', }}>
      <TopAppBar 
        showHomeButton         
        onHomeClick={() => navigate('/')}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 0, m: 0 }}>
        <ProjectTableEditor />
      </Box>
    </Box>
  );
}