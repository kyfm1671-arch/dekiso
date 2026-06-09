import React, { useState, useEffect, useRef } from 'react';
import PostItem from './PostItem.jsx';

// 🌟 isEveryone というプロップスを受け取れるようにしました
export default function PostFeed({ posts, isEveryone = false }) {
  const [latestId, setLatestId] = useState(null);
  const prevTopIdRef = useRef(posts && posts[0] ? posts[0].id : null);

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const currentTopPost = posts[0];
    const currentTopId = currentTopPost.id;

    const postAgeMs = Date.now() - new Date(currentTopPost.createdAt).getTime();
    if (postAgeMs < 1500) {
      setLatestId(currentTopId);
      const timer = setTimeout(() => setLatestId(null), 3000);
      prevTopIdRef.current = currentTopId;
      return () => clearTimeout(timer);
    }

    if (currentTopId !== prevTopIdRef.current) {
      setLatestId(currentTopId);
      const timer = setTimeout(() => setLatestId(null), 3000);
      prevTopIdRef.current = currentTopId;
      return () => clearTimeout(timer);
    }
  }, [posts]);

  if (!posts || posts.length === 0) {
    return <p style={{ textAlign: 'left', fontSize: '12px', color: '#9ca3af', padding: '1rem 0' }}>記録はありません</p>;
  }

  return (
    // 🌟 isEveryone が true の列には 'everyone-feed' という特別なクラスをつけます
    <section className={`feed ${isEveryone ? 'everyone-feed' : ''}`} style={{ width: '100%' }}>
      <style>{`
        @keyframes slideInAndDown {
          0% { opacity: 0; transform: translateY(-20px); max-height: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; }
          100% { opacity: 1; transform: translateY(0); max-height: 200px; margin-bottom: 16px; }
        }
        @keyframes softGlow {
          0% { background-color: transparent; box-shadow: 0 0 0px transparent; }
          15% { background-color: var(--glow-color-light); box-shadow: 0 0 12px var(--glow-color); }
          100% { background-color: transparent; box-shadow: 0 0 0px transparent; }
        }
        .new-post-animation {
          animation: slideInAndDown 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards, softGlow 3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          border-radius: 6px;
          overflow: hidden;
        }
        .old-post-item { margin-bottom: 16px; }

        /* ========================================================
           🌟 みんなのきろく（everyone-feed）のときだけの絶対強制ウルトラ上書き設定
           ======================================================== */
        .everyone-feed .old-post-item,
        .everyone-feed .new-post-animation {
          margin-bottom: 0px !important;
          height: 32px !important;       /* 外枠のliの隙間をゼロにして32px固定 */
        }

        .everyone-feed .post-item {
          padding-top: 4px !important;   /* index.cssの padding: 16px 0 を完全破壊 */
          padding-bottom: 4px !important;
          border-top: 1px solid #eee !important;
          min-height: 0px !important;
          height: 32px !important;       /* 中身のarticleも32px固定 */
          display: flex !important;
          align-items: center !important;
        }

        /* 最初のアイテムの線を消す */
        .everyone-feed ul > li:first-child .post-item {
          border-top: none !important;
        }

        /* 左側のカラーバーをindex.cssのmin-height:40pxから20pxへ強制縮小 */
        .everyone-feed .post-color {
          min-height: 20px !important;
          height: 20px !important;
          width: 6px !important;
        }

        /* 時間の文字サイズを小さく */
        .everyone-feed .post-meta time {
          font-size: 12px !important;
        }
      `}</style>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {posts.map((post) => {
          const isLatest = post.id === latestId;
          const glowColor = post.colorHex;
          const glowColorLight = post.colorHex + '25';

          return (
            <li 
              key={post.id} 
              className={isLatest ? 'new-post-animation' : 'old-post-item'}
              style={{
                '--glow-color': glowColor,
                '--glow-color-light': glowColorLight,
                transition: 'all 0.3s ease'
              }}
            >
              {/* compact={isEveryone} でPostItem側にも伝えます */}
              <PostItem post={post} compact={isEveryone} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}