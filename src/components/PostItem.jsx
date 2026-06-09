import { formatPostTime } from '../utils/time.js';

export default function PostItem({ post, compact = false }) {
  const isMine = post.author === 'me';

  return (
    <article className={`post-item ${compact ? 'is-compact' : ''}`}>
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
        
        {/* コンパクト（みんなのきろく）ではないときだけタグを表示 */}
        {!compact && post.tags && post.tags.length > 0 && (
          <ul className="post-tags">
            {post.tags.map((tag) => (
              /* 🌟 ここ！タグの文字色だけをきろくの色（無ければデフォルト色）にします */
              <li key={tag} style={{ color: post.colorHex ?? '#3a3a3a' }}>
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}