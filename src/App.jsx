import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());
  const [screen, setScreen] = useState('record');

  // 1. 左側：自分の投稿だけを絞り込む
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
              boxSizing: 'border-box'
            }}>
              
              {/* 🌟【引っ越し】「もどる」ボタンを一番上に持ってきました！ */}
              <div style={{ 
                textAlign: 'left', 
                marginBottom: '24px', 
                paddingLeft: '4px' 
              }}>
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
                  {/* シンプルな矢印をつけて押しやすくしています */}
                  ← 記録画面にもどる
                </button>
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
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    みんなのきろく（ダミー）
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