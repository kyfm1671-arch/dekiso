import { formatPostTime } from '../utils/time.js';

// 🌟 PostFeedから「compact」という合図を受け取れるようにします
export default function PostItem({ post, compact = false }) {
  const isMine = post.author === 'me';

  return (
    // 🌟 compact（みんなの記録）のときは、クラス名に 'is-compact' を追加します
    <article className={`post-item ${compact ? 'is-compact' : ''}`}
      style={compact ? {
        paddingTop: '6px',
        paddingBottom: '6px',
        minHeight: 'auto'
      } : {}}
    >
      <div
        className="post-color"
        style={{ 
          backgroundColor: post.colorHex ?? '#c8c8c8',
          // 🌟 compactのときは、カラーバーの高さをきゅっと短く（18px）します
          height: compact ? '18px' : undefined 
        }}
        aria-hidden
      />
      <div className="post-body" style={compact ? { padding: '2px 0' } : {}}>
        <div className="post-meta" style={compact ? { margin: 0, alignItems: 'center' } : {}}>
          <time 
            dateTime={post.createdAt}
            // 🌟 compactのときは、時間の文字サイズを少し小さく（11px）します
            style={compact ? { fontSize: '11px', color: '#4b5563' } : {}}
          >
            {formatPostTime(post.createdAt)}
          </time>
          {isMine && <span className="post-mine">自分</span>}
        </div>
        
        {/* 🌟 自分の記録のときだけタグを表示（コンパクト版のときはApp.jsxで消えているので通り抜けますが、安全のために残します） */}
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