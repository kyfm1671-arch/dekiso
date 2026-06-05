import React, { useState, useEffect, useRef } from 'react';
import PostItem from './PostItem.jsx';

export default function PostFeed({ posts }) {
  // カレンダーの開閉状態（最初は閉じておく）
  const [showCalendar, setShowCalendar] = useState(false);

  // 初期値として「今日」の日付を自動セット
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - offset)).toISOString();
    return localISOTime.split('T')[0];
  });

  // 新着投稿を光らせる・動かすためのアニメーション管理
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

  // 1. 【条件分岐】自分の記録はカレンダーの日付で絞り込み、みんなの記録は最新30件をそのまま通す
  const filteredPosts = posts.filter(post => {
    if (post.author === 'me') {
      if (!post.createdAt) return false;
      const postDate = post.createdAt.split('T')[0];
      return postDate === selectedDate;
    }
    return true;
  });

  // 投稿をレンダリングする共通関数（アニメーション付き）
  const renderPostList = (targetAuthor) => {
    const list = filteredPosts.filter(p => p.author === targetAuthor);

    if (list.length === 0) {
      return <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af', padding: '1.5rem 0' }}>記録はありません</p>;
    }

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {list.map((post) => {
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
    );
  };

  return (
    <section className="feed" aria-label="みんなの記録" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* 綺麗なCSSアニメーションを定義 */}
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

      {/* 📅 カレンダーを開くための「優しいボタン」配置エリア */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setShowCalendar(!showCalendar)}
          style={{
            background: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            padding: '0.4rem 1rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: showCalendar ? '#f3f4f6' : '#ffffff',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          <span>📅</span> {showCalendar ? 'カレンダーを閉じる' : '過去の記録を振り返る'}
        </button>

        {/* ボタンを押して開いたときだけ優しく表示されるカレンダー */}
        {showCalendar && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.3rem 0.6rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#374151',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
              animation: 'fadeIn 0.2s ease'
            }}
          />
        )}
      </div>

      {/* 📊 左右二段組のスッキリしたレイアウト */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
        
        {/* 左側：あなたのきろく（カレンダーの日付と連動） */}
        <div>
          <h3 style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '1.2rem', paddingBottom: '0.4rem', borderBottom: '2px solid #818cf8' }}>
            あなたのきろく
          </h3>
          {renderPostList('me')}
        </div>

        {/* 右側：みんなのきろく（常にリアルタイム最新30件） */}
        <div>
          <h3 style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '1.2rem', paddingBottom: '0.4rem', borderBottom: '2px solid #34d399' }}>
            みんなのきろく（リアルタイム）
          </h3>
          {renderPostList('everyone')}
        </div>

      </div>
    </section>
  );
}