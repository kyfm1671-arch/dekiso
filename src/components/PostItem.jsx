import { formatPostTime } from '../utils/time.js';

export default function PostItem({ post, compact = false }) {
  const isMine = post.author === 'me';

  return (
    <article className={`post-item ${compact ? 'is-compact' : ''}`}>
      
      {/* 🌟 構文エラーを完璧に修正したコンパクト専用CSS設定 */}
      {compact && (
        <style>{`
          /* 1. みんなのきろく（is-compact）全体の高さを限界まで引き締める */
          .post-item.is-compact {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            margin-bottom: 0px !important;
            min-height: 0px !important;
            height: 32px !important; /* 🌟 縦幅を32pxにガチッと固定します */
            display: flex !important;
            align-items: center !important;
          }

          /* 2. 左側のカラーバーをマスの高さ（32px）に合わせて小さく */
          .post-item.is-compact .post-color {
            height: 18px !important;
            width: 6px !important;
            margin: 0 !important;
          }

          /* 3. 中の余白をリセットして垂直中央に配置 */
          .post-item.is-compact .post-body {
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
          }

          .post-item.is-compact .post-meta {
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
          }

          /* 4. 時間の文字サイズを脇役らしくすっきり小さく */
          .post-item.is-compact time {
            font-size: 11px !important;
            color: #6b7280 !important;
            line-height: 1 !important;
          }

          /* 自分ラベルの隙間を微調整 */
          .post-item.is-compact .post-mine {
            margin-left: 6px !important;
            font-size: 10px !important;
            padding: 1px 4px !important;
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