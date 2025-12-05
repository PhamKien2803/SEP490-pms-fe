import { Select, Typography, Row, Col } from "antd";
const { Option } = Select;
const { Title, Text } = Typography;

import { useEffect, useState } from "react";
import { Student } from "../../../types/parent";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { parentDashboardApis, postApis } from "../../../services/apiServices";
import { toast } from "react-toastify";
import { ContainerOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { Post, PostsResponse } from "../../../types/post";
import ListPost from "../../list-post/ListPost";

const ParentNews = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [listChild, setListChild] = useState<Student[]>([]);
  const user = useCurrentUser();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataPosts, setDataPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);

  useEffect(() => {
    getDataListChild();
  }, [user?.parent]);

  const getDataListChild = async () => {
    if (!user?.parent) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await parentDashboardApis.getListChild(user.parent);
      const students = response?.students || [];
      setListChild(students);

      if (students.length > 0) {
        setSelectedStudentId(students[0]._id);
      }
    } catch (error) {
      typeof error === "string"
        ? toast.info(error)
        : toast.error("Lỗi khi tải danh sách con");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      getListPost();
    } else {
      setDataPosts([]);
    }
  }, [selectedStudentId]);

  const getListPost = async () => {
    setIsLoadingPosts(true);
    try {
      const response: PostsResponse = await postApis.getListPostByStudent(
        selectedStudentId || ""
      );
      setDataPosts(response?.posts);
    } catch (error) {
      typeof error === "string"
        ? toast.info(error)
        : toast.error("Lỗi khi tải danh sách tin tức");
      setDataPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Title
        level={2}
        style={{
          marginBottom: 16,
          color: "#0050b3",
        }}
      >
        <ContainerOutlined style={{ marginRight: 10, color: "#1890ff" }} />
        Tin tức & Hoạt động
      </Title>

      <Row
        gutter={[16, 16]}
        align="middle"
        style={{
          marginBottom: 10,
        }}
      >
        <Col>
          <Text strong style={{ fontSize: 16 }}>
            <UserSwitchOutlined style={{ marginRight: 8, color: "#faad14" }} />
            Xem tin tức của:
          </Text>
        </Col>

        <Col>
          <Select
            value={selectedStudentId}
            onChange={(value) => setSelectedStudentId(value)}
            placeholder="Vui lòng chọn tên con"
            size="large"
            loading={isLoading}
            style={{ width: "100%" }}
            disabled={listChild.length === 0 && !isLoading}
          >
            {listChild.map((student) => (
              <Option key={student._id} value={student._id}>
                {student?.fullName} ({student?.studentCode})
              </Option>
            ))}
            {listChild.length === 0 && !isLoading && (
              <Option disabled value="no-child">
                Không tìm thấy học sinh liên kết
              </Option>
            )}
          </Select>
        </Col>
      </Row>
      <ListPost
        dataPosts={dataPosts}
        fetchApi={getListPost}
        loading={isLoadingPosts}
      />
    </div>
  );
};

export default ParentNews;
