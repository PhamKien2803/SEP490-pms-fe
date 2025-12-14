import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Card,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { studentApis } from "../../services/apiServices";
import { usePagePermission } from "../../hooks/usePagePermission";
import { toast } from "react-toastify";
import { StudentRecord } from "../../types/student-management";
import dayjs from "dayjs";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { constants } from "../../constants";

const StudentManagement: React.FC = () => {
  usePageTitle("Quản lý học sinh - Cá Heo Xanh");

  const navigate = useNavigate();
  const { canCreate, canUpdate, canDelete } = usePagePermission();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApis.getListStudent({
        page: 1,
        limit: 1000,
      });
      setStudents(res.data || []);
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Tải dữ liệu học sinh thất bại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);


  const filteredStudents = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(keyword) ||
        s.studentCode.toLowerCase().includes(keyword)
    );
  }, [students, searchKeyword]);


  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchKeyword]);


  const paginatedStudents = useMemo(() => {
    // Tính toán chỉ số bắt đầu và kết thúc cho phân trang
    const start =
      ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 10);
    return filteredStudents.slice(
      start,
      start + (pagination.pageSize ?? 10)
    );
  }, [filteredStudents, pagination]);

  const handleTableChange = (p: TablePaginationConfig) => {
    setPagination({
      current: p.current,
      pageSize: p.pageSize,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await studentApis.deleteStudent(deletingId);
      toast.success("Xóa học sinh thành công!");

      setStudents((prev) => {
        const newData = prev.filter((s) => s._id !== deletingId);
        const maxPage = Math.ceil(
          newData.length / (pagination.pageSize ?? 10)
        );

        setPagination((p) => ({
          ...p,
          current: Math.min(p.current ?? 1, maxPage || 1),
        }));

        return newData;
      });

      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Xóa học sinh thất bại.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };


  const columns: ColumnsType<StudentRecord> = useMemo(
    () => [
      {
        title: "STT",
        width: 70,
        align: "center",
        render: (_, __, index) => {
          const page = pagination.current ?? 1;
          const pageSize = pagination.pageSize ?? 10;
          return (page - 1) * pageSize + index + 1;
        },
      },
      {
        title: "Mã học sinh",
        dataIndex: "studentCode",
      },
      {
        title: "Họ và tên",
        dataIndex: "fullName",
        width: 200,
        fixed: "left",
      },
      {
        title: "Ngày sinh",
        dataIndex: "dob",
        render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
      },
      {
        title: "Giới tính",
        dataIndex: "gender",
        width: 100,
      },
      {
        title: "Địa chỉ",
        dataIndex: "address",
        width: 300,
        render: (address: string) => (
          <Tooltip title={address}>
            <div
              style={{
                maxWidth: 280,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {address}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Hành động",
        align: "center",
        width: 150,
        fixed: "right",
        render: (_, record) => (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                onClick={() =>
                  navigate(
                    `${constants.APP_PREFIX}/students/detail/${record._id}`
                  )
                }
              />
            </Tooltip>
            {canUpdate && (
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  icon={<EditOutlined style={{ color: "#1890ff" }} />}
                  onClick={() =>
                    navigate(
                      `${constants.APP_PREFIX}/students/edit/${record._id}`
                    )
                  }
                />
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setDeletingId(record._id);
                    setIsDeleteModalOpen(true);
                  }}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ],
    [pagination, canUpdate, canDelete, navigate]
  );


  return (
    <div style={{ padding: 22 }}>
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Quản lý học sinh
              </Typography.Title>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchStudents}
                  loading={loading}
                />
                <Input.Search
                  placeholder="Mã HS hoặc Họ tên..."
                  allowClear
                  style={{ width: 250 }}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                {canCreate && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      navigate(`${constants.APP_PREFIX}/students/create`)
                    }
                  >
                    Tạo mới
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        }
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={paginatedStudents}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredStudents.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (t, r) => `${r[0]}–${r[1]} của ${t} học sinh`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <ModalConfirm
        open={isDeleteModalOpen}
        loading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Bạn có chắc chắn muốn xóa học sinh này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default StudentManagement;
