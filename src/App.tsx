import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { ConfigProvider, notification } from 'antd';
import theme from './themes';
import './app.css';
import { messages } from './constants/message';
import { useEffect } from 'react';


function App() {
  useEffect(() => {
    const handleOffline = () => {
      notification.error({
        key: messages.MSG_ERROR_CODE_NETWORK,
        message: messages.MSG_ERROR_CODE_NETWORK,
        closable: false,
        duration: 0,
      });
    };
    const handleOnline = () => {
      notification.destroy(messages.MSG_ERROR_CODE_NETWORK);
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <ConfigProvider
      theme={theme}
      form={{
        requiredMark: false,
        scrollToFirstError: true,
        validateMessages: { required: messages.REQUIRED },
      }}
      button={{ autoInsertSpace: false }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
