import { formatPostTime } from '../utils/time.js';

export default function PostItem({ post, compact = false }) {
  const isMine = post.author === 'me';
  // 🌟 投稿の色（指定がなければデフォルトのグレー）
  const postColor = post.colorHex ?? '#c8c8c8';

  return (
    <article className={`post-item ${compact ? 'is-compact' : ''}`}>
      <div
        className="post-color"
        style={{ backgroundColor: postColor }}
        aria-hidden
      />
      <div className="post-body">
        <div className="post-meta">
          {/* 🌟 時間の文字色を、その投稿の色（postColor）にします */}
          <time 
            dateTime={post.createdAt} 
            style={{ color: postColor, fontWeight: '500' }}
          >
            {formatPostTime(post.createdAt)}
          </time>
          
          {/* 🌟 「自分」の文字色も、その投稿の色（postColor）にします */}
          {isMine && (
            <span 
              className="post-mine" 
              style={{ color: postColor, fontWeight: '500', marginLeft: '6px' }}
            >
              自分
            </span>
          )}
        </div>
        
        {/* コンパクトではないとき（自分の記録）だけタグを表示 */}
        {!compact && post.tags && post.tags.length > 0 && (
          <ul className="post-tags">
            {post.tags.map((tag) => (
              {/* 🌟 タグの文字色も、その投稿の色（postColor）に統一！ */}
              <li key={tag} style={{ color: postColor, fontWeight: '500' }}>
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}