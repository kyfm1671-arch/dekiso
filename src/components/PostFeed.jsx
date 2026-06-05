import { useEffect, useState, useRef } from 'react';
import PostItem from './PostItem.jsx';

export default function PostFeed({ posts }) {
  // 📅 カレンダーを表示するかどうかのフラグ
  const [showCalendar, setShowCalendar] = useState(false);

  // 📅 選択された日付を保存する（初期値は今日）
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - offset)).toISOString();
    return localISOTime.split('T')[0];
  });

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

  return (
    <section className="feed" aria-label="みんなの記録" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* 📅 【今回追加】画面の最上部に優しく寄り添うカレンダーボタンエリア */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '1rem', 
        marginBottom: '2rem',
        marginTop: '1rem'
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
            outline: 'none'
          }}
        >
          <span>📅</span> {showCalendar ? 'カレンダーを閉じる' : '過去のきろくを振り返る'}
        </button>

        {/* ボタンを押して開いたときだけ横に現れる日付選択 */}
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
              outline: 'none'
            }}
          />
        )}
      </div>

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

      <ul className="post-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
              <PostItem post={post} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}