import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Button,
  Avatar,
  Select,
  Spin,
  Alert,
  Descriptions,
  Space,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  SolutionOutlined,
  CalendarOutlined,
  PhoneOutlined,
  SafetyOutlined,
  FlagOutlined,
  SmileOutlined,
  MailOutlined,
  LoadingOutlined,
  SyncOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { ParentInfo, StudentListItem, ParentStudentsListResponse } from "../../../types/parent";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { parentDashboardApis } from "../../../services/apiServices";

const { Title, Text } = Typography;
const { Option } = Select;

const PRIMARY_COLOR = '#FF9DAB';
const ACCENT_COLOR = '#D81B60';
const TEXT_COLOR = '#424242';
const BACKGROUND_GREY = '#FAF3F8';

const getDisplayDate = (dob: dayjs.Dayjs | null): string => {
  return dob ? dob.format("DD/MM/YYYY") : "Chưa cập nhật";
};

interface ParentCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ParentCard: React.FC<ParentCardProps> = ({ icon, label, value }) => (
  <Card 
    bordered={false}
    style={{ 
      backgroundColor: '#FFF0F5', 
      borderRadius: 8, 
      marginBottom: 16,
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }}
    bodyStyle={{ padding: '15px 20px' }}
  >
    <Space direction="vertical" size={2} style={{ width: '100%' }}>
      <Text type="secondary" style={{ fontSize: 13, color: '#6A6A6A' }}>{label}</Text>
      <Space>
        {icon}
        <Text strong style={{ color: TEXT_COLOR, fontSize: 16 }}>{value}</Text>
      </Space>
    </Space>
  </Card>
);

const StudentInfoSection: React.FC<{ student: StudentListItem, parent: ParentInfo }> = ({ student, parent }) => {
  return (
    <Card 
      style={{ 
        borderRadius: 12, 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', 
        border: `1px solid ${BACKGROUND_GREY}`,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Row gutter={[0, 0]}>
        
        <Col xs={24} lg={8} style={{ 
          padding: 40, 
          background: PRIMARY_COLOR, 
          color: 'white',
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          <div style={{ width: '100%', textAlign: 'center' }}> 
            <Avatar 
              size={140} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: 'white', 
                color: ACCENT_COLOR,
                marginBottom: 20, 
                border: '6px solid rgba(255, 255, 255, 0.3)',
                fontSize: 70, 
              }} 
            />
            <Title 
              level={3} 
              style={{ 
                margin: '0 0 4px 0', 
                fontWeight: 700, 
                color: 'white', 
                fontSize: 28,
                textAlign: 'center', 
                width: '100%',
              }} 
            >
              {student.fullName}
            </Title>
          </div>
          <Text style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: 16,
              textAlign: 'center',
              width: '100%',
              marginTop: 10,
            }}
          >
            Mã HS: <Text strong style={{ color: 'white' }}>{student.studentCode}</Text>
          </Text>
          <Divider style={{ margin: '30px 0', borderColor: 'rgba(255, 255, 255, 0.3)' }} />
          
          <Descriptions 
            column={1} 
            size="middle" 
            colon={false} 
            layout="horizontal" 
            labelStyle={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', width: 120 }} 
            contentStyle={{ color: 'white', fontWeight: 500 }}
            style={{ width: '100%', maxWidth: 300, textAlign: 'left' }}
          >
            <Descriptions.Item label={<Space><CalendarOutlined /> Ngày sinh</Space>}>{getDisplayDate(student.dob)}</Descriptions.Item>
            <Descriptions.Item label={<Space><SmileOutlined /> Giới tính</Space>}>{student.gender}</Descriptions.Item>
            <Descriptions.Item label={<Space><IdcardOutlined /> CCCD</Space>}>{student.idCard}</Descriptions.Item>
          </Descriptions>
        </Col>

        <Col xs={24} lg={16} style={{ padding: 40, background: '#fff' }}>
          
          <Title level={4} style={{ 
            margin: '0 0 30px 0', 
            borderLeft: `5px solid ${ACCENT_COLOR}`, 
            paddingLeft: 15, 
            fontWeight: 700, 
            color: TEXT_COLOR,
            fontSize: 22,
          }}>
            <SolutionOutlined style={{ marginRight: 12, color: ACCENT_COLOR }} /> CHI TIẾT HỒ SƠ
          </Title>
          
          <Descriptions 
            title="Chi tiết khác"
            column={{ xs: 1, sm: 2, lg: 3 }} 
            size="small" 
            labelStyle={{ fontWeight: 600, color: '#6A6A6A' }} 
            contentStyle={{ color: TEXT_COLOR }}
            style={{ marginBottom: 30 }}
          >
            <Descriptions.Item label="Dân tộc"><FlagOutlined style={{ color: ACCENT_COLOR, marginRight: 5 }}/>{student?.nation}</Descriptions.Item>
            <Descriptions.Item label="Tôn giáo"><SafetyOutlined style={{ color: ACCENT_COLOR, marginRight: 5 }}/>{student?.religion}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ margin: '30px 0' }}>
            <Text strong style={{ color: TEXT_COLOR, fontSize: 16 }}>
              <TeamOutlined style={{ marginRight: 8, color: ACCENT_COLOR }} /> THÔNG TIN LIÊN HỆ PHỤ HUYNH
            </Text>
          </Divider>
          
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24} md={8}>
              <ParentCard 
                label="Họ tên Phụ huynh" 
                value={parent.fullName}
                icon={<UserOutlined style={{ color: ACCENT_COLOR }}/>}
              />
            </Col>
            <Col xs={24} md={8}>
              <ParentCard 
                label="Số điện thoại" 
                value={parent.phoneNumber}
                icon={<PhoneOutlined style={{ color: ACCENT_COLOR }}/>}
              />
            </Col>
            <Col xs={24} md={8}>
              <ParentCard 
                label="Email" 
                value={parent.email}
                icon={<MailOutlined style={{ color: ACCENT_COLOR }}/>}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

const StudentInfo: React.FC = () => {
  const [data, setData] = useState<ParentStudentsListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const currentUser = useCurrentUser();
  const userId = currentUser?.parent;
    
  const fetchParentStudents = useCallback(async () => {
    if (!userId) {
        setError("Không tìm thấy ID người dùng (Phụ huynh).");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await parentDashboardApis.getParentStudent(userId);
      
      if (!response.success) {
           throw new Error("API trả về thất bại.");
      }
      
      const transformedStudents: StudentListItem[] = response.students.map(s => ({
          ...s,
          dob: s.dob ? dayjs(s.dob) : null,
      }));

      setData({...response, students: transformedStudents});
      
      if (transformedStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(transformedStudents[0]._id);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc quyền truy cập.");
      setData(null);
      toast.error("Tải dữ liệu học sinh thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, userId]);

  useEffect(() => {
    fetchParentStudents();
  }, [fetchParentStudents]);

  const currentStudent = useMemo(() => {
    if (!data || !selectedStudentId) return null;
    return data.students.find(s => s._id === selectedStudentId);
  }, [data, selectedStudentId]);

  const cardHeader = useMemo(
    () => (
      <Row justify="space-between" align="middle" style={{ padding: '20px 24px' }}>
        <Col>
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: TEXT_COLOR }}>
            <TeamOutlined style={{ marginRight: 10, color: ACCENT_COLOR }}/> Hồ sơ học sinh
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <Tooltip title="Làm mới dữ liệu">
              <Button
                icon={<SyncOutlined spin={loading} style={{ fontSize: 16 }} />}
                onClick={fetchParentStudents}
                loading={loading}
                type="text"
                style={{ color: TEXT_COLOR }}
              />
            </Tooltip>
            {data && data.students.length > 1 && (
              <Select
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                style={{ width: 250 }}
                size="large"
                placeholder="Chọn học sinh để xem..."
                dropdownStyle={{ borderRadius: 8 }}
                suffixIcon={<UserOutlined style={{ color: ACCENT_COLOR }} />}
              >
                {data.students.map(student => (
                  <Option key={student._id} value={student._id}>
                    <Space>
                      <Avatar size="small" style={{ backgroundColor: ACCENT_COLOR }} icon={<UserOutlined />} />
                      {student.fullName}
                    </Space>
                  </Option>
                ))}
              </Select>
            )}
          </Space>
        </Col>
      </Row>
    ),
    [data, selectedStudentId, loading, fetchParentStudents]
  );

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: 'center', background: BACKGROUND_GREY, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 50, color: ACCENT_COLOR }} spin />} 
          tip={<Text strong style={{ marginTop: 20, color: TEXT_COLOR, fontSize: 18 }}>Đang tải hồ sơ của con bạn...</Text>}
          style={{ padding: '80px 0' }} 
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", background: BACKGROUND_GREY, minHeight: '100vh' }}>
      <Card
        title={cardHeader}
        bordered={false}
        style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)", border: 'none' }}
        bodyStyle={{ padding: 0 }}
      >
        {error && (
          <Alert message="Lỗi Tải Dữ Liệu" description={error} type="error" showIcon style={{ margin: 24, borderRadius: 8 }} />
        )}

        {(!data || data.students.length === 0) && !error && (
          <Alert message="Thông báo" description="Không tìm thấy thông tin học sinh nào được liên kết với tài khoản này." type="info" showIcon style={{ margin: 24, borderRadius: 8 }} />
        )}
      </Card>

      {currentStudent && data && (
        <StudentInfoSection 
          student={currentStudent} 
          parent={data.parent}
        />
      )}
    </div>
  );
};

export default StudentInfo;