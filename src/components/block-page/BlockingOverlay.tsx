import React from 'react';
import { Button, Result } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const BlockingOverlay: React.FC = () => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f0f2f5'
        }}
    >
        <Result
            icon={<InfoCircleOutlined style={{ color: '#1677ff' }} />}
            title="Phiên làm việc của bạn cần được làm mới"
            subTitle="Đã có một vài thay đổi về quyền truy cập. Vui lòng làm mới trang để đồng bộ và tiếp tục."
            extra={
                <Button type="primary" onClick={() => window.location.reload()}>
                    Làm mới ngay
                </Button>
            }
        />
    </div>
);

export default BlockingOverlay;