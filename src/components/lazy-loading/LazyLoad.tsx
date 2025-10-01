/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, lazy } from 'react';
import { Spin, Flex } from 'antd';

export const LazyLoad = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) => {
    const LazyComponent = lazy(importFunc);

    return (props: any) => (
        <Suspense
            fallback={
                <Flex
                    align="center"
                    justify="center"
                    style={{ minHeight: '100vh' }}
                >
                    <Spin size="large" />
                </Flex>
            }
        >
            <LazyComponent {...props} />
        </Suspense>
    );
};