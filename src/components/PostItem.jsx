import { formatPostTime } from '../utils/time.js';

export default function PostItem({ post, compact = false }) {
  const isMine = post.author === 'me';
  const postColor = post.colorHex ?? '#c8c8c8';

  // 投稿専用のユニークな識別用クラス名
  const uniqueClass = `post-item-${post.id}`;

  return (
    <article className={`post-item ${uniqueClass} ${compact ? 'is-compact' : ''}`}>
      
      {/* index.css の color 設定を !important で強制染色 */}
      <style>{`
        .${uniqueClass} .post-meta time {
          color: ${postColor} !important;
          font-weight: 600 !important;
        }
        .${uniqueClass} .post-mine {
          color: ${postColor} !important;
          font-weight: 600 !important;
        }
        .${uniqueClass} .post-tags li {
          color: ${postColor} !important;
          font-weight: 600 !important;
        }
      `}</style>

      <div
        className="post-color"
        style={{ backgroundColor: postColor }}
        aria-hidden
      />
      <div className="post-body">
        <div className="post-meta">
          <time dateTime={post.createdAt}>
            {formatPostTime(post.createdAt)}
          </time>
          
          {/* 🌟 修正ポイント：compact（みんなのきろく）の時、かつ自分(isMine)の時だけ「自分」を表示します */}
          {compact && isMine && <span className="post-mine">自分</span>}
        </div>
        
        {/* コンパクトではないとき（自分の記録）だけタグを表示 */}
        {!compact && post.tags && post.tags.length > 0 && (
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