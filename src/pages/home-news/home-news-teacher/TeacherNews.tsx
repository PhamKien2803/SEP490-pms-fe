import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import ListPost from "../../list-post/ListPost";
import { Post, PostsResponse } from "../../../types/post";
import { postApis } from "../../../services/apiServices";
import { toast } from "react-toastify";
import { Divider, Typography } from "antd";
import { ContainerOutlined } from "@ant-design/icons"; 
const { Title } = Typography;

function TeacherNews() {
  const user = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const teacherId = user?.staff;

  const fetchPosts = async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const response: PostsResponse = await postApis.getListPost(teacherId);
      setPosts(response.posts);
    } catch (error: any) {
      toast.error(error || "Không thể tải danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [teacherId]);
  return (
    <div>
      <Title
        level={2}
        style={{
          marginBottom: 8,
          color: "#0050b3",
          paddingLeft: "50px",
          paddingBottom: "20px",
        }}
      >
        <ContainerOutlined style={{ marginRight: 10, color: "#1890ff" }} />
        Danh sách bài viết
      </Title>
      <Divider style={{ margin: "16px 0" }} />
      <ListPost fetchApi={fetchPosts} dataPosts={posts} loading={loading} />
    </div>
  );
}

export default TeacherNews;
