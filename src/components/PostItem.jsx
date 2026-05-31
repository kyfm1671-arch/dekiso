import { formatPostTime } from '../utils/time.js';

export default function PostItem({ post }) {
  const isMine = post.author === 'me';

  return (
    <article className="post-item">
      <div
        className="post-color"
        style={{ backgroundColor: post.colorHex ?? '#c8c8c8' }}
        aria-hidden
      />
      <div className="post-body">
        <div className="post-meta">
          <time dateTime={post.createdAt}>{formatPostTime(post.createdAt)}</time>
          {isMine && <span className="post-mine">自分</span>}
        </div>
        {post.tags.length > 0 && (
          <ul className="post-tags">
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
