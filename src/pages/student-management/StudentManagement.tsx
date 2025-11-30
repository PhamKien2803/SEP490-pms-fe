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
import {
  StudentRecord,
} from "../../types/student-management";
import dayjs from "dayjs";
import ModalConfirm from "../../modal/common/ModalConfirm/ModalConfirm";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { constants } from "../../constants";

const StudentManagement: React.FC = () => {
  usePageTitle('Quản lý học sinh - Cá Heo Xanh');
  const [dataStudents, setDataStudents] = useState<StudentRecord[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { canCreate, canUpdate, canDelete } = usePagePermission();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20"],
    position: ["bottomCenter"],
    showTotal: (total) => `Tổng số: ${total} bản ghi`,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchListStudent = useCallback(
    async (params: { page: number; limit: number }) => {
      setLoading(true);
      try {
        const response = await studentApis.getListStudent(params);
        setDataStudents(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.page.totalCount,
          current: response.page.page,
          pageSize: response.page.limit,
        }));
      } catch (error) {
        toast.error(
          typeof error === "string" ? error : "Tải dữ liệu học sinh thất bại."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchListStudent({
      page: pagination.current!,
      limit: pagination.pageSize!,
    });
  }, [fetchListStudent, pagination.current, pagination.pageSize]);

  const filteredStudent = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return dataStudents;
    return dataStudents.filter(
      (item) =>
        item.fullName.toLowerCase().includes(keyword) ||
        item.studentCode.toLowerCase().includes(keyword)
    );
  }, [dataStudents, searchKeyword]);

  const handleTableChange = useCallback(
    (newPagination: TablePaginationConfig) => {
      setPagination((prev) => ({
        ...prev,
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      }));
    },
    []
  );


  const handleOpenDeleteModal = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await studentApis.deleteStudent(deletingId);
      toast.success("Xóa học sinh thành công!");
      setIsDeleteModalOpen(false);
      if (dataStudents.length === 1 && pagination.current! > 1) {
        setPagination((prev) => ({ ...prev, current: prev.current! - 1 }));
      } else {
        fetchListStudent({
          page: pagination.current!,
          limit: pagination.pageSize!,
        });
      }
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
        key: "stt",
        width: 80,
        align: "center",
        render: (_, __, index) => {
          const page = pagination.current ?? 1;
          const pageSize = pagination.pageSize ?? 5;
          return (page - 1) * pageSize + index + 1;
        },
      },
      {
        title: "Mã học sinh",
        dataIndex: "studentCode",
        key: "studentCode",
        // width: 130,
      },
      {
        title: "Họ và tên",
        dataIndex: "fullName",
        key: "fullName",
        fixed: "left",
        width: 200,
      },
      {
        title: "Ngày sinh",
        dataIndex: "dob",
        key: "dob",
        // width: 120,
        render: (dob: string) => dayjs(dob).format("DD/MM/YYYY"),
      },
      {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        width: 100,
        render: (gender: String) => gender,
      },
      {
        title: "Địa chỉ",
        dataIndex: "address",
        key: "address",
        width: 300,
        render: (address: string) => (
          <Tooltip title={address}>
            <div
              style={{
                maxWidth: 280,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }}
            >
              {address}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Hành động",
        key: "action",
        align: "center",
        width: 150,
        fixed: "right",
        render: (_: unknown, record: StudentRecord) => (
          <Space size="middle">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                onClick={() => navigate(`${constants.APP_PREFIX}/students/detail/${record._id}`)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa hồ sơ">
              {canUpdate && (
                <Button
                  type="text"
                  icon={<EditOutlined style={{ color: "#1890ff" }} />}
                  onClick={() => navigate(`${constants.APP_PREFIX}/students/edit/${record._id}`)}
                />
              )}
            </Tooltip>
            <Tooltip title="Xóa hồ sơ">
              {canDelete && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleOpenDeleteModal(record._id)}
                />
              )}
            </Tooltip>
          </Space>
        ),
      },
    ],
    [canUpdate, canDelete, handleOpenDeleteModal]
  );

  const cardHeader = useMemo(
    () => (
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Quản lý học sinh
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            <Tooltip title="Làm mới danh sách">
              <Button
                style={{ marginRight: 5 }}
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchListStudent({
                    page: pagination.current!,
                    limit: pagination.pageSize!,
                  })
                }
                loading={loading}
              >
              </Button>
            </Tooltip>
            <Input.Search
              placeholder="Mã HS hoặc Họ tên..."
              style={{ width: 250 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`${constants.APP_PREFIX}/students/create`)}
              >
                Tạo mới
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    ),
    [searchKeyword, canCreate]
  );

  return (
    <div style={{ padding: "22px" }}>
      <Card
        title={cardHeader}
        bordered={false}
        style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
      >
        <Table
          columns={columns}
          dataSource={filteredStudent}
          loading={loading}
          rowKey="_id"
          pagination={searchKeyword.trim() ? false : pagination}
          onChange={handleTableChange}
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
