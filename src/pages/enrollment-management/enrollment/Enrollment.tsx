import React from 'react';
import { Row, Col, Layout } from 'antd';
import SchoolInfo from '../../../components/school-infor/SchoolInfo';
import EnrollmentForm from '../../../components/enrollment-form/EnrollmentForm';
import { Header } from '../../../components/pms/Header';
import Footer from '../../../components/pms/Footer';
import { usePageTitle } from '../../../hooks/usePageTitle';

const { Content } = Layout;

const Enrollment: React.FC = () => {
    usePageTitle('Nhập học cho con - Cá Heo Xanh');
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header />
            <Content style={{ padding: '24px', background: '#f0f2f5' }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <EnrollmentForm />
                    </Col>
                    <Col xs={24} lg={8}>
                        <SchoolInfo />
                    </Col>
                </Row>
            </Content>
            <Footer />
        </Layout>
    );
};

export default Enrollment;