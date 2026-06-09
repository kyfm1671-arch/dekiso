import { formatPostTime } from '../utils/time.js';

export default function PostItem({ post, compact = false }) {
  const isMine = post.author === 'me';

  return (
    <article className={`post-item ${compact ? 'is-compact' : ''}`}>
      {/* 🌟 強制的にサイズを小さくするための専用CSSスタイルシートをここに埋め込みます */}
      {compact && (
        <style>{`
          /* みんなのきろく（is-compact）全体の縦幅をきゅっと縮める */
          .post-item.is-compact {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
            margin-bottom: 0px !important;
            min-height: auto !important;
            height: 32px !important; /* 🌟 1マスの高さを32pxに固定します */
          }
          /* 左側のカラーバーもマスの高さに合わせて短く */
          .post-item.is-compact .post-color {
            height: 18px !important;
          }
          /* 中の文字の位置を中央に揃え、文字サイズを小さく */
          .post-item.is-compact .post-body {
            padding: 0 !important;
          }
          .post-item.is-compact .post-meta {
            margin: 0 !important;
          }
          .post-item.is-compact time {
            font-size: 11px !important;
            color: #6b7280 !important;
          }
        `}</style>
      )}

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
        
        {/* 自分の記録のときだけタグを表示 */}
        {!compact && post.tags.length > 0 && (
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