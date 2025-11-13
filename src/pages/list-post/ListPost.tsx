import { useState, useMemo } from "react";
import {
  List,
  Typography,
  Spin,
  Row,
  Col,
  Button,
  Modal,
  Card,
  Avatar,
  Divider,
} from "antd";
import { PictureOutlined, FileAddOutlined } from "@ant-design/icons";
import PostItem from "./components/post-item/PostItem";
import { Post } from "../../types/post";
import CreatePost from "./create-post/CreatePost";
import EditPost from "./update-post/UpdatePost";
import { usePagePermission } from "../../hooks/usePagePermission";

const { Title, Text, Link } = Typography;

const formatTimeAgo = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return `${Math.floor(interval)} năm trước`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)} tháng trước`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${Math.floor(interval)} ngày trước`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${Math.floor(interval)} giờ trước`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)} phút trước`;
  }
  return "Vừa xong";
};

interface ListPostProps {
  dataPosts: Post[];
  fetchApi: () => void;
  loading: boolean;
}

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; post: Post };

const ListPost = (props: ListPostProps) => {
  const { dataPosts, loading, fetchApi } = props;
  const { canCreate } = usePagePermission();

  const [modalState, setModalState] = useState<ModalState>({ mode: "closed" });

  const recentPosts = useMemo(() => {
    return dataPosts.slice(0, 5);
  }, [dataPosts]);

  const handleSuccess = () => {
    setModalState({ mode: "closed" });
    fetchApi();
  };

  const showCreateModal = () => {
    setModalState({ mode: "create" });
  };

  const showEditModal = (postToEdit: Post) => {
    setModalState({ mode: "edit", post: postToEdit });
  };

  const handleCancel = () => {
    setModalState({ mode: "closed" });
  };

  const renderCreatePostCard = () => (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 24,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Avatar
          size="large"
          style={{ backgroundColor: "#1890ff", marginRight: 12 }}
        >
          GV
        </Avatar>
        <Button
          type="default"
          onClick={showCreateModal}
          block
          size="large"
          style={{
            backgroundColor: "#f0f2f5",
            borderColor: "#e0e0e0",
            color: "#606060",
            fontWeight: "normal",
            borderRadius: 20,
            textAlign: "left",
            paddingLeft: 20,
          }}
        >
          Bạn muốn chia sẻ điều gì hôm nay?
        </Button>
      </div>
      <Divider style={{ margin: "12px 0" }} />
      <Row gutter={16}>
        <Col span={12}>
          <Button
            icon={<PictureOutlined />}
            block
            size="middle"
            onClick={showCreateModal}
          >
            Ảnh/Video
          </Button>
        </Col>
        <Col span={12}>
          <Button
            icon={<FileAddOutlined />}
            block
            size="middle"
            onClick={showCreateModal}
          >
            Tài liệu
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const renderRecentPosts = () => (
    <Card
      title={<Title level={5}>Bài viết gần đây</Title>}
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 24,
      }}
    >
      <List
        dataSource={recentPosts}
        loading={loading}
        itemLayout="horizontal"
        renderItem={(post) => (
          <List.Item style={{ border: "none", padding: "12px 0px" }}>
            <List.Item.Meta
              avatar={
                <Avatar
                  shape="square"
                  size={64}
                  src={"/default-post-image.png"}
                  style={{ borderRadius: 8 }}
                />
              }
              title={
                <Link
                  href="#"
                  style={{
                    fontWeight: 600,
                    color: "#333",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {post.title || "Bài viết không có tiêu đề"}
                </Link>
              }
              description={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong style={{ color: "#555" }}>
                    {"Ban biên tập"}
                  </strong>
                  {" • "}
                  {formatTimeAgo(post.createdAt)}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderLoading = () => (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <Spin size="large" />
      <Text type="secondary" style={{ display: "block", marginTop: 10 }}>
        Đang tải bài viết...
      </Text>
    </div>
  );

  const renderEmpty = () => (
    <Card
      style={{
        textAlign: "center",
        padding: "40px",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
      }}
    >
      <Title level={5} type="secondary">
        Chưa có bài viết nào được đăng.
      </Title>
    </Card>
  );

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Row justify="center" gutter={[24, 24]}>
        <Col xs={24} md={24} lg={16} xl={15}>
          {canCreate && renderCreatePostCard()}

          {loading
            ? renderLoading()
            : dataPosts.length === 0
              ? renderEmpty()
              : (
                <List
                  grid={{ gutter: 16, column: 1 }}
                  dataSource={dataPosts}
                  renderItem={(post) => (
                    <List.Item style={{ border: "none", padding: 0 }}>
                      <PostItem
                        key={post.postId}
                        post={post}
                        onEdit={() => showEditModal(post)}
                        onDeleteSuccess={fetchApi}
                      />
                    </List.Item>
                  )}
                />
              )}
        </Col>

        <Col xs={0} md={0} lg={8} xl={9}>
          {renderRecentPosts()}
        </Col>
      </Row>

      <Modal
        title={
          modalState.mode === "create" ? "Tạo Bài Viết Mới" : "Chỉnh Sửa Bài Viết"
        }
        visible={modalState.mode !== "closed"}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose={true}
        width={600}
        bodyStyle={{ padding: "10px 0 0 0" }}
      >
        {modalState.mode === "create" && canCreate && (
          <CreatePost onPostSuccess={handleSuccess} onCancel={handleCancel} />
        )}
        {modalState.mode === "edit" && (
          <EditPost
            post={modalState.post}
            onEditSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </Modal>
    </div>
  );
};

export default ListPost;