import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Select,
  Spin,
  Alert,
  Table,
  Space,
  Popconfirm,
  Tooltip,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SyncOutlined,
  TeamOutlined,
  PlusOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";

import { IGuardianRecord, GuardianRelationship } from "../../types/guardians";
import { ParentStudentsListResponse } from "../../types/parent";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { guardianApis, parentDashboardApis } from "../../services/apiServices";
import { usePagePermission } from "../../hooks/usePagePermission";

import CreateGuardian from "../../modal/guardian/create-guardian/CreateGuardian";
import UpdateGuardian from "../../modal/guardian/update-guardian/UpdateGuardian";
import DetailGuardian from "../../modal/guardian/detail-guardian/DetailGuardian";
import { usePageTitle } from "../../hooks/usePageTitle";

const { Title, Text } = Typography;
const { Option } = Select;

const ACCENT_COLOR = "#08979c";
const TEXT_COLOR = "#08979c";

const GuardianManagement: React.FC = () => {
  usePageTitle("Đăng ký người đón - Cá Heo Xanh");
  const [studentsData, setStudentsData] =
    useState<ParentStudentsListResponse | null>(null);
  const [guardians, setGuardians] = useState<IGuardianRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingGuardian, setEditingGuardian] =
    useState<IGuardianRecord | null>(null);
  const [detailGuardian, setDetailGuardian] = useState<IGuardianRecord | null>(
    null
  );

  const currentUser = useCurrentUser();
  const parentId = currentUser?.parent;

  const { canCreate, canUpdate, canDelete } = usePagePermission();

  const fetchParentStudents = useCallback(async () => {
    if (!parentId) {
      setError("Không tìm thấy ID Phụ huynh.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await parentDashboardApis.getParentStudent(parentId);
      const students = response?.students || [];

      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0]._id);
      }
      setStudentsData(response);
    } catch (err) {
      const errorMessage =
        error || "Không thể tải danh sách học sinh. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [parentId, selectedStudentId, error]);

  const fetchGuardians = useCallback(
    async (studentId: string) => {
      setIsLoading(true);
      try {
        const response = await guardianApis.getListGuardianByStudent(studentId);
        setGuardians(response.data);
      } catch (err) {
        const errorMessage = error || "Tải danh sách người đưa đón thất bại.";
        toast.error(errorMessage);
        setGuardians([]);
      } finally {
        setIsLoading(false);
      }
    },
    [error]
  );

  useEffect(() => {
    fetchParentStudents();
  }, [fetchParentStudents]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchGuardians(selectedStudentId);
    } else {
      setGuardians([]);
    }
  }, [selectedStudentId, fetchGuardians]);

  const handleRefresh = () => {
    if (selectedStudentId) {
      fetchGuardians(selectedStudentId);
    }
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
  };

  const handleDelete = async (id: string) => {
    if (!selectedStudentId) return;
    if (!canDelete) {
      toast.error("Bạn không có quyền xóa.");
      return;
    }
    try {
      await guardianApis.deleteGuardian(id);
      toast.success("Xóa người đưa đón thành công!");
      fetchGuardians(selectedStudentId);
    } catch (error: any) {
      const errorMessage = error || "Xóa người đưa đón thất bại.";
      toast.error(errorMessage);
    }
  };

  const currentStudent = useMemo(() => {
    return (
      studentsData?.students.find((s) => s._id === selectedStudentId) || null
    );
  }, [studentsData, selectedStudentId]);

  const columns = [
    {
      title: "Họ và Tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Quan Hệ",
      dataIndex: "relationship",
      key: "relationship",
      render: (text: GuardianRelationship, record: IGuardianRecord) => (
        <Space direction="vertical" size={0}>
          <Text>{text}</Text>
          {record.relationshipDetail && (
            <Text type="secondary" italic style={{ fontSize: 12 }}>
              ({record.relationshipDetail})
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Ngày Bắt Đầu Ủy Quyền",
      dataIndex: "pickUpDate",
      key: "pickUpDate",
      render: (date: Dayjs | null) => {
        if (!date) {
          return <Tag>Chưa ủy quyền</Tag>;
        }
        return dayjs(date).format("DD/MM/YYYY");
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      responsive: ["lg"] as "lg"[],
      render: (note: string | undefined) =>
        note ? (
          <Tooltip title={note}>
            <Text ellipsis>{note}</Text>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as "center",
      render: (_: any, record: IGuardianRecord) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => setDetailGuardian(record)}
              type="text"
              style={{ color: ACCENT_COLOR }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditingGuardian(record)}
              type="text"
              style={{ color: ACCENT_COLOR }}
              disabled={!canUpdate}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn chắc chắn muốn xóa người đưa đón này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
            placement="left"
            disabled={!canDelete}
          >
            <Tooltip title="Xóa">
              <Button
                icon={<DeleteOutlined />}
                danger
                type="text"
                disabled={!canDelete}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const cardHeader = useMemo(
    () => (
      <Row
        justify="space-between"
        align="middle"
        style={{ padding: "20px 24px" }}
      >
        <Col>
          <Title
            level={3}
            style={{ margin: 0, fontWeight: 700, color: TEXT_COLOR }}
          >
            <TeamOutlined style={{ marginRight: 10, color: ACCENT_COLOR }} />{" "}
            Quản lý Người đưa đón
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <Tooltip title="Làm mới dữ liệu">
              <Button
                icon={
                  <SyncOutlined spin={isLoading} style={{ fontSize: 16 }} />
                }
                onClick={handleRefresh}
                loading={isLoading}
                type="text"
                style={{ color: TEXT_COLOR }}
              />
            </Tooltip>

            {studentsData && studentsData.students.length > 0 && (
              <Select
                value={selectedStudentId}
                onChange={handleStudentChange}
                style={{ width: 250 }}
                size="large"
                placeholder="Chọn học sinh..."
                suffixIcon={<UserOutlined style={{ color: ACCENT_COLOR }} />}
                disabled={isLoading}
              >
                {studentsData.students.map((student) => (
                  <Option key={student._id} value={student._id}>
                    {student.fullName}
                  </Option>
                ))}
              </Select>
            )}

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              disabled={!selectedStudentId || isLoading || !canCreate}
              style={{
                backgroundColor: ACCENT_COLOR,
                borderColor: ACCENT_COLOR,
              }}
            >
              Thêm Người Đón
            </Button>
          </Space>
        </Col>
      </Row>
    ),
    [studentsData, selectedStudentId, isLoading, canCreate]
  );

  if (isLoading && !studentsData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin
          indicator={
            <LoadingOutlined
              style={{ fontSize: 50, color: ACCENT_COLOR }}
              spin
            />
          }
          tip="Đang tải dữ liệu ban đầu..."
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  return (
    <div style={{ padding: "40px", minHeight: "100vh" }}>
      <Card
        title={cardHeader}
        bordered={false}
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          border: "none",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {(!studentsData || studentsData.students.length === 0) && (
          <Alert
            message="Thông báo"
            description="Tài khoản này chưa liên kết với học sinh nào. Không thể quản lý người đưa đón."
            type="warning"
            showIcon
            style={{ margin: 24, borderRadius: 8 }}
          />
        )}

        {currentStudent && (
          <Alert
            message={
              <Text strong>
                Học sinh đang chọn: {currentStudent.fullName} (Mã HS:{" "}
                {currentStudent.studentCode})
              </Text>
            }
            description={`Phụ huynh (bạn): ${studentsData?.parent.fullName} | SĐT: ${studentsData?.parent.phoneNumber}`}
            type="info"
            showIcon
            style={{ margin: "10px 24px" }}
          />
        )}

        {selectedStudentId && (
          <Table
            columns={columns}
            dataSource={guardians}
            rowKey="_id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
            style={{ padding: "0 24px 24px" }}
          />
        )}
      </Card>

      <CreateGuardian
        open={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false);
          if (selectedStudentId) fetchGuardians(selectedStudentId);
        }}
        selectedStudentId={selectedStudentId}
        parentId={parentId}
        canCreate={canCreate}
      />

      {editingGuardian && (
        <UpdateGuardian
          open={!!editingGuardian}
          onClose={() => setEditingGuardian(null)}
          onSuccess={() => {
            setEditingGuardian(null);
            if (selectedStudentId) fetchGuardians(selectedStudentId);
          }}
          guardianRecord={editingGuardian}
          canUpdate={canUpdate}
          parentId={parentId}
        />
      )}

      {detailGuardian && (
        <DetailGuardian
          open={!!detailGuardian}
          onClose={() => setDetailGuardian(null)}
          guardianRecord={detailGuardian}
        />
      )}
    </div>
  );
};

export default GuardianManagement;
