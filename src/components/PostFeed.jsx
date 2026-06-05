import React, { useState, useEffect, useRef } from 'react';
import PostItem from './PostItem.jsx';

export default function PostFeed({ posts }) {
  // 🌟 初期値として「今日（日本時間）」の日付を自動セット
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - offset)).toISOString();
    return localISOTime.split('T')[0];
  });

  // 🌟 新着投稿を光らせる・動かすためのアニメーション管理
  const [latestId, setLatestId] = useState(null);
  const prevTopIdRef = useRef(posts && posts[0] ? posts[0].id : null);

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const currentTopPost = posts[0];
    const currentTopId = currentTopPost.id;

    // 【自分用】表示された瞬間に生まれたて（1.5秒以内）なら光らせる
    const postAgeMs = Date.now() - new Date(currentTopPost.createdAt).getTime();
    if (postAgeMs < 1500) {
      setLatestId(currentTopId);
      const timer = setTimeout(() => setLatestId(null), 3000);
      prevTopIdRef.current = currentTopId;
      return () => clearTimeout(timer);
    }

    // 【みんな用】新しく他人のデータが降ってきたら光らせる
    if (currentTopId !== prevTopIdRef.current) {
      setLatestId(currentTopId);
      const timer = setTimeout(() => setLatestId(null), 3000);
      prevTopIdRef.current = currentTopId;
      return () => clearTimeout(timer);
    }
  }, [posts]);

  // 1. 【新ルール】自分の記録はカレンダーの日付で絞り込み、みんなの記録は日付関係なくそのまま（最新30件）出す！
  const filteredPosts = posts.filter(post => {
    // 自分の投稿（me）のときだけ、カレンダーの日付と一致するものだけに絞り込む
    if (post.author === 'me') {
      if (!post.createdAt) return false;
      const postDate = post.createdAt.split('T')[0];
      return postDate === selectedDate;
    }
    // みんなの投稿（everyone）のときは、日付に関わらずすべて（最新30件）通過させる！
    return true;
  });

  // 投稿をレンダリングする共通関数（アニメーション付き）
  const renderPostList = (targetAuthor) => {
    const list = filteredPosts.filter(p => p.author === targetAuthor);

    if (list.length === 0) {
      return <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af', padding: '1rem 0' }}>この日の記録はありません</p>;
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
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* 元の綺麗なCSSアニメーションをそのまま継承 */}
      <style>{`
        @keyframes slideInAndDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
            margin-bottom: 16px;
          }
        }

        @keyframes softGlow {
          0% {
            background-color: transparent;
            box-shadow: 0 0 0px transparent;
          }
          15% {
            background-color: var(--glow-color-light);
            box-shadow: 0 0 12px var(--glow-color);
          }
          100% {
            background-color: transparent;
            box-shadow: 0 0 0px transparent;
          }
        }

        .new-post-animation {
          animation: 
            slideInAndDown 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards,
            softGlow 3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          border-radius: 6px;
          overflow: hidden;
        }

        .old-post-item {
          margin-bottom: 16px;
        }
      `}</style>
      
      {/* 📅 カレンダー（日付選択）エリア */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: '#ffffff',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #f3f4f6'
      }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.5rem' }}>
          📅 あなたの記録を振り返る日付
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            outline: 'none'
          }}
        />
      </div>

      {/* 📊 左右二段組のレイアウト */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* 左側：あなたのきろく（カレンダーと連動） */}
        <div>
          <h3 style={{ textAlign: 'center', fontWeight: 'bold', color: '#4b5563', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #818cf8' }}>
            あなたのきろく
          </h3>
          {renderPostList('me')}
        </div>

        {/* 右側：みんなのきろく（常にリアルタイム最新30件） */}
        <div>
          <h3 style={{ textAlign: 'center', fontWeight: 'bold', color: '#4b5563', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #34d399' }}>
            みんなのきろく（リアルタイム）
          </h3>
          {renderPostList('everyone')}
        </div>

      </div>
    </div>
  );
}