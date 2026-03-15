import { useEffect } from 'react'
import './App.css'
import 'antd/dist/reset.css';
import { useLoading } from './contexts/LoadingContext';
import { injectLoading } from './utils/fetcher';

function App() {
  const loadingApi = useLoading();

  useEffect(() => {
    injectLoading(loadingApi);
  }, [loadingApi]);
  

  return (
    <div className="card">
      <header>
        <h1>WorkLog</h1>
      </header>
      <main>
        {/* 这里放你的主要内容或组件 */}
        <p>WELCOME TO WorkLog！</p>
        {/* 可以添加登录、导航等 */}
      </main>
    </div>
  )
}

export default App;
