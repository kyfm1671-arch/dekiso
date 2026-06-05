import React, { useState, useEffect, useRef } from 'react';
import PostItem from './PostItem.jsx';

export default function PostFeed({ posts }) {
  // カレンダーを表示するかどうかのフラグ（最初は閉じておく）
  const [showCalendar, setShowCalendar] = useState(false);

  // 初期値として「今日」の日付を自動セット（日本時間ズレ防止）
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - offset)).toISOString();
    return localISOTime.split('T')[0];
  });

  // 新着投稿のアニメーション管理用
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

  // 🌟【超重要】親から渡されたpostsに「みんなの記録」が混ざっているか判定します
  // リストの中に1件でも他人(everyone)の投稿があれば、ここは「みんなの記録」の列だと判断します。
  const isEveryoneColumn = posts.some(post => post.author === 'everyone');

  // 🌟【仕分けルール】
  // みんなの記録列なら：カレンダーは完全に無視して、届いた30件をそのまま全部出す
  // あなたの記録列なら：カレンダーの日付と完全一致するものだけにギュッと絞り込む
  const displayPosts = isEveryoneColumn
    ? posts 
    : posts.filter(post => {
        if (!post.createdAt) return false;
        const postDate = post.createdAt.split('T')[0];
        return postDate === selectedDate;
      });

  return (
    <section className="feed" aria-label="投稿リスト" style={{ width: '100%' }}>
      
      {/* 綺麗な滑り込み＆発光アニメーションCSS */}
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
      `}</style>

      {/* 📅 【ご希望の配置】みんなの記録（リアルタイム）の側には何も出さず、
          あなたの記録（振り返る必要がある側）の上にだけ、スマートにカレンダーボタンを1つ出現させます */}
      {!isEveryoneColumn && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          marginTop: '0.5rem'
        }}>
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            style={{
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              padding: '0.4rem 1.2rem',
              fontSize: '0.85rem',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: showCalendar ? '#f3f4f6' : '#ffffff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            <span>📅</span> {showCalendar ? 'カレンダーを閉じる' : '過去のきろくを振り返る'}
          </button>

          {/* ボタンを押して開いたときだけ下にフワッと現れる日付選択 */}
          {showCalendar && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '0.3rem 0.7rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#374151',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }}
            />
          )}
        </div>
      )}

      {/* 実際の投稿リストを表示 */}
      {displayPosts.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af', padding: '2rem 0' }}>
          {isEveryoneColumn ? 'まだ誰も投稿していません' : 'この日のあなたの記録はありません'}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {displayPosts.map((post) => {
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
                <PostItem post={post} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}