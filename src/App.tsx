import { AppRouter } from './routes/AppRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { ConfigProvider, Flex, notification, Spin } from 'antd';
import theme from './themes';
import { messages } from './constants/message';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './redux/authSlice';
import type { AppDispatch, RootState } from './redux/store';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitializing } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

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

  if (isInitializing && localStorage.getItem('token')) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" />
      </Flex>
    );
  }

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
        <AppRouter />
      </QueryClientProvider>
    </ConfigProvider>
  );
}
export default App;