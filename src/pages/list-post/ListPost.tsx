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
import "./ListPost.css"; // 👈 Nhập file CSS

const { Title, Text, Link } = Typography;

// (Hàm formatTimeAgo giữ nguyên, không thay đổi)
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
    <Card className="list-post__create-card">
      <div className="list-post__create-top">
        <Avatar size="large" className="list-post__create-avatar">
          GV
        </Avatar>
        <Button
          type="default"
          onClick={showCreateModal}
          block
          size="large"
          className="list-post__create-input"
        >
          Bạn muốn chia sẻ điều gì hôm nay?
        </Button>
      </div>
      <Divider className="list-post__create-divider" />
      <Row gutter={16} className="list-post__create-actions">
        <Col span={12}>
          <Button
            icon={<PictureOutlined />}
            block
            size="middle"
            onClick={showCreateModal}
            className="list-post__action-btn list-post__action-btn--photo"
            type="text" // 👈 Thay đổi để thân thiện hơn
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
            className="list-post__action-btn list-post__action-btn--file"
            type="text" // 👈 Thay đổi để thân thiện hơn
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
      className="list-post__recent-card"
    >
      <List
        dataSource={recentPosts}
        loading={loading}
        itemLayout="horizontal"
        renderItem={(post) => (
          <List.Item className="list-post__recent-item">
            <List.Item.Meta
              avatar={
                <Avatar
                  shape="square"
                  size={64}
                  src={"/default-post-image.png"}
                  className="list-post__recent-avatar"
                />
              }
              title={
                <Link href="#" className="list-post__recent-title">
                  {post.title || "Bài viết không có tiêu đề"}
                </Link>
              }
              description={
                <Text type="secondary" className="list-post__recent-meta">
                  <strong style={{ color: "#555" }}>{"Ban biên tập"}</strong>
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
    <div className="list-post__loading">
      <Spin size="large" />
      <Text type="secondary" style={{ display: "block", marginTop: 10 }}>
        Đang tải bài viết...
      </Text>
    </div>
  );

  const renderEmpty = () => (
    <Card className="list-post__empty">
      <Title level={5} type="secondary">
        Chưa có bài viết nào được đăng.
      </Title>
    </Card>
  );

  return (
    <div className="list-post__container">
      <Row justify="center" gutter={[24, 24]}>
        {/* Cột chính (Nội dung) */}
        <Col xs={24} md={24} lg={16} xl={15}>
          {canCreate && renderCreatePostCard()}

          {loading ? (
            renderLoading()
          ) : dataPosts.length === 0 ? (
            renderEmpty()
          ) : (
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={dataPosts}
              className="list-post__feed"
              renderItem={(post) => (
                <List.Item className="list-post__feed-item">
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

        {/* Cột phụ (Sidebar) */}
        <Col xs={0} md={0} lg={8} xl={9}>
          {renderRecentPosts()}
        </Col>
      </Row>

      {/* Modal (Giữ nguyên) */}
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