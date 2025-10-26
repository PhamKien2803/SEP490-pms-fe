import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, Typography, Descriptions, Tag } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { teacherApis } from '../../../../services/apiServices';
import { StudentDetailResponse } from '../../../../types/teacher';

const { Title } = Typography;

function StudentDetails() {
    const { id } = useParams<{ id: string }>();
    const [student, setStudent] = useState<StudentDetailResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!id) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await teacherApis.getStudentDetails(id);
                setStudent(data);
            } catch (error) {
                console.error(error);
                toast.error('Không thể tải thông tin học sinh.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin tip="Đang tải thông tin học sinh..." size="large" />
            </div>
        );
    }

    if (!student) {
        return <div>Không tìm thấy thông tin học sinh.</div>;
    }

    return (
        <Card style={{ maxWidth: 900, margin: 'auto', marginTop: 40 }}>
            <Title level={3}>{student.fullName}</Title>

            <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label="Mã học sinh">{student.studentCode}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{student.gender}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                    {dayjs(student.dob).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Mã định danh">{student.idCard}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{student.address}</Descriptions.Item>
                <Descriptions.Item label="Dân tộc">{student.nation}</Descriptions.Item>
                <Descriptions.Item label="Tôn giáo">{student.religion}</Descriptions.Item>
                <Descriptions.Item label="Nhóm lớp">{student.classGroup}</Descriptions.Item>
                <Descriptions.Item label="Tình trạng">
                    {student.active ? <Tag color="green">Đang học</Tag> : <Tag color="red">Ngưng học</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">{student.createdBy}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {dayjs(student.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Người cập nhật">{student.updatedBy}</Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                    {dayjs(student.updatedAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Giấy khai sinh">
                    <FilePdfOutlined style={{ color: 'red' }} /> {student.birthCertFile?.filename}
                </Descriptions.Item>
                <Descriptions.Item label="Giấy khám sức khỏe">
                    <FilePdfOutlined style={{ color: 'red' }} /> {student.healthCertFile?.filename}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
}

export default StudentDetails;
