import { Button, Flex, Typography } from 'antd';
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, useErrorBoundary } from 'react-error-boundary';
// import CarbonWarningIcon from '@assets/icon/icon-carbon-warning.png';
import { constants } from '../../constants/index';
import { useLocation } from 'react-router-dom';
// import './styles.css';

const { Text } = Typography;

interface ErrorBoundaryProps extends React.PropsWithChildren {
    fallback?: React.ReactNode;
}

const WarningFallback = () => {
    const { resetBoundary } = useErrorBoundary();

    const handleRetry = () => {
        // clear session storage
        sessionStorage.clear();
        resetBoundary();
    };

    return (
        <Flex className="error-boundary-fallback" vertical gap={10} justify="center" align="center">
            {/* <img src={CarbonWarningIcon} alt="CarbonWarningIcon" width={52} height={52} /> */}
            <Text className="error-boundary-text" type="secondary" strong>
                {constants.SOMETHING_WENT_WRONG}
            </Text>
            <Button type="default" onClick={handleRetry}>
                {constants.RETRY}
            </Button>
        </Flex>
    );
};

const ErrorBoundary = ({ children, fallback }: ErrorBoundaryProps) => {
    const { pathname } = useLocation();
    return (
        <ReactErrorBoundary key={pathname} fallback={fallback ? fallback : <WarningFallback />}>
            {children}
        </ReactErrorBoundary>
    );
};

export default ErrorBoundary;
