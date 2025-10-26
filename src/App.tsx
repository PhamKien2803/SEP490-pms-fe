import { AppRouter } from './routes/AppRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { ConfigProvider, Flex, Spin, App as AntdApp } from 'antd';
import theme from './themes';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './redux/authSlice';
import { ToastContainer } from 'react-toastify';
import type { AppDispatch, RootState } from './redux/store';
import { usePermissionWatcher } from './hooks/usePermissionWatcher';
import { messages } from './constants/message';
import BlockingOverlay from './components/block-page/BlockingOverlay';
import viVN from 'antd/locale/vi_VN';
import 'dayjs/locale/vi';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitializing, user, permissionsStale } = useSelector((state: RootState) => state.auth);
  usePermissionWatcher();
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);
  if (isInitializing && sessionStorage.getItem('token')) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" />
      </Flex>
    );
  }
  if (permissionsStale) {
    return <BlockingOverlay />;
  }
  return (
    <ConfigProvider locale={viVN}
      theme={theme}
      form={{
        requiredMark: false,
        scrollToFirstError: true,
        validateMessages: { required: messages.REQUIRED },
      }}
      button={{ autoInsertSpace: false }}
    >
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;