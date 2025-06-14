import { useState } from "react";
import { useSelector } from "react-redux";
import "./style.css";
import Post from "../../components/post";
import { HashLoader } from "react-spinners";
import axios from "axios";

export default function Explore() {
  const { user } = useSelector((state) => ({ ...state }));
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/search?query=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setPosts(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "Error searching posts");
    }
  };

  return (
    <div className="explore">
      <div className="explore_wrapper">
        <div className="explore_header">
          <h2>Explore</h2>
          <form onSubmit={handleSearch} className="search_form">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        <div className="explore_content">
          {loading ? (
            <div className="loading">
              <HashLoader color="#1876f2" />
            </div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : posts.length > 0 ? (
            <div className="posts">
              {posts.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  user={user}
                  socket={null}
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="no_results">No posts found</div>
          ) : (
            <div className="search_prompt">
              Enter a search term to find posts
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 