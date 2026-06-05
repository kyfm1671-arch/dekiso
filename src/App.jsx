import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());
  const [screen, setScreen] = useState('record');

  // カレンダーを表示するかどうかのフラグ
  const [showCalendar, setShowCalendar] = useState(false);

  // 初期値として「今日」の日付を自動セット
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return (new Date(today - offset)).toISOString().split('T')[0];
  });

  // 左側：自分の投稿だけを絞り込む
  const myPosts = posts.filter((p) => p.author === 'me');
  
  // 右側：自分も含めたすべての投稿をそのまま流す
  const everyoneElsePosts = posts;

  const handlePost = useCallback(
    (data) => {
      addPost(data);
      setTimeout(() => setScreen('feed'), 800);
    },
    [addPost]
  );

  return (
    <div className="app-shell">
      <header className="header">
        <h1 className="app-title">こころの色</h1>
      </header>
      <main className="main">
        <div key={screen} className="screen">
          {/* 【記録画面】 */}
          {screen === 'record' ? (
            <PostComposer colors={palette} onPost={handlePost} />
          ) : (
            
            /* 【参照画面（feed）】 */
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 8px',
              width: '100%',
              boxSizing: 'border-box',
              position: 'relative' // 🌟ボタンを絶対配置するための基準
            }}>
              
              {/* 「もどる」ボタンと「カレンダー」を配置する最上部コンテナ */}
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between', // 🌟左に「もどる」、右に「カレンダー」を並べる
                alignItems: 'center',
                marginBottom: '24px', 
                padding: '0 4px',
                position: 'relative'
              }}>
                {/* 左側：もどるボタン */}
                <button 
                  onClick={() => setScreen('record')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    padding: '8px 0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ← 記録画面にもどる
                </button>

                {/* 右側：カレンダー表示ボタン（右側の列の真上に来るように配置） */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}>
                  <button 
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      color: '#6b7280',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>📅</span> {showCalendar ? '閉じる' : '過去のきろくを振り返る'}
                  </button>

                  {/* 開いたときだけ横にピョコッと現れる日付選択 */}
                  {showCalendar && (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        padding: '2px 6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#374151',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* スマホでも横並びをキープする左右の記録エリア */}
              <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '12px',
                width: '100%'
              }}>
                
                {/* 左側：あなたのきろく */}
                <section style={{ 
                  flex: '1', 
                  width: '50%',
                  minWidth: '0',
                  textAlign: 'left'
                }}>
                  {/* 🌟ここが綺麗に右側と高さ一致します */}
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    あなたのきろく
                  </h2>
                  <PostFeed posts={myPosts} />
                </section>

                {/* 右側：みんなのきろく */}
                <section style={{ 
                  flex: '1', 
                  width: '50%',
                  minWidth: '0',
                  textAlign: 'left'
                }}>
                  {/* 🌟ここが綺麗に左側と高さ一致します */}
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    みんなのきろく（リアルタイム）
                  </h2>
                  <PostFeed posts={everyoneElsePosts} />
                </section>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}