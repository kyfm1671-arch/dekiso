import { formatPostTime } from '../utils/time.js';

export default function PostItem({ post, compact = false }) {
  const isMine = post.author === 'me';

  return (
    <article 
      className={`post-item ${compact ? 'is-compact' : ''}`}
      // 🌟 compact（みんなの記録）のときは、index.cssの padding: 16px 0 を強制上書きします
      style={compact ? {
        paddingTop: '6px',
        paddingBottom: '6px',
        paddingLeft: '0px',
        paddingRight: '0px',
        marginTop: '0px',
        marginBottom: '0px',
        height: '32px', // 🌟 高さを32pxにギュッと固定
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box'
      } : {}}
    >
      <div
        className="post-color"
        // 🌟 index.css の min-height: 40px を「minHeight: '0px'」で完全に無効化します！
        style={{ 
          backgroundColor: post.colorHex ?? '#c8c8c8',
          minHeight: compact ? '0px' : undefined, 
          height: compact ? '20px' : undefined, // カラーバーをスマートに
          width: compact ? '6px' : undefined
        }}
        aria-hidden
      />
      <div 
        className="post-body"
        style={compact ? { padding: '0', margin: '0', display: 'flex', alignItems: 'center' } : {}}
      >
        <div 
          className="post-meta"
          style={compact ? { margin: '0', display: 'flex', alignItems: 'center' } : {}}
        >
          <time 
            dateTime={post.createdAt}
            style={compact ? { fontSize: '12px', color: '#888', lineHeight: '1' } : {}}
          >
            {formatPostTime(post.createdAt)}
          </time>
          {isMine && (
            <span 
              className="post-mine"
              style={compact ? { fontSize: '10px', marginLeft: '6px' } : {}}
            >
              自分
            </span>
          )}
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