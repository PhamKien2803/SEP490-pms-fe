import { useState } from "react";
import { List, Typography, Spin, Row, Col, Button, Modal, Card } from "antd";
import PostItem from "./components/post-item/PostItem";
import { Post } from "../../types/post";
import CreatePost from "./create-post/CreatePost";
import EditPost from "./update-post/UpdatePost";
import { usePagePermission } from "../../hooks/usePagePermission";

const { Title, Text } = Typography;

interface ListPostProps {
  dataPosts: Post[];
  fetchApi: () => void;
  loading: boolean;
}

const ListPost = (props: ListPostProps) => {
  const { dataPosts, loading, fetchApi } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { canCreate } = usePagePermission();

  const handlePostCreated = () => {
    setIsModalVisible(false);
    fetchApi();
  };

  const handleEditPost = (postToEdit: Post) => {
    setEditingPost(postToEdit);
  };

  const handleEditCompleted = () => {
    setEditingPost(null);
    fetchApi();
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (editingPost) {
    return (
      <EditPost
        post={editingPost}
        onEditSuccess={handleEditCompleted}
        onCancel={handleEditCompleted}
      />
    );
  }

  return (
    <div
      style={{
        padding: "24px 0",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={20} md={18} lg={12} xl={10}>
          {canCreate && (
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Row align="middle" gutter={16}>
                <Col flex="40px">
                  <span
                    style={{
                      display: "inline-block",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#1890ff",
                      textAlign: "center",
                      lineHeight: "40px",
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  >
                    GV
                  </span>
                </Col>
                <Col flex="auto">
                  <Button
                    type="default"
                    onClick={showModal}
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
                    <span style={{ textAlign: "left", width: "100%" }}>
                      Bạn muốn chia sẻ điều gì hôm nay?
                    </span>
                  </Button>
                </Col>
              </Row>
            </Card>
          )}
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
              <Text
                type="secondary"
                style={{ display: "block", marginTop: 10 }}
              >
                Đang tải bài viết...
              </Text>
            </div>
          ) : dataPosts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px",
                backgroundColor: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Title level={5} type="secondary">
                Chưa có bài viết nào được đăng.
              </Title>
            </div>
          ) : (
            <List
              itemLayout="vertical"
              dataSource={dataPosts}
              renderItem={(post) => (
                <PostItem
                  key={post.postId}
                  post={post}
                  onEdit={handleEditPost}
                  onDeleteSuccess={fetchApi}
                />
              )}
              style={{ paddingBottom: 24 }}
            />
          )}
        </Col>
      </Row>

      <Modal
        title="Tạo Bài Viết Mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose={true}
        width={600}
        bodyStyle={{ padding: "10px 0 0 0" }}
      >
        {canCreate && (
          <CreatePost
            onPostSuccess={handlePostCreated}
            onCancel={handleCancel}
          />
        )}
      </Modal>
    </div>
  );
};

export default ListPost;
