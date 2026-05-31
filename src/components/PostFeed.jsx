import PostItem from './PostItem.jsx';

export default function PostFeed({ posts }) {
  return (
    <section className="feed" aria-label="みんなの記録">
      <h2 className="feed-title">みんなの記録</h2>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id}>
            <PostItem post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}
