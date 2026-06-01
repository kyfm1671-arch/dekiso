import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());
  const [screen, setScreen] = useState('record');

  // 1. データを「自分の記録」と「みんなの記録」に分ける
  const myPosts = posts.filter((p) => p.author === 'me');
  const everyoneElsePosts = posts.filter((p) => p.author !== 'me');

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
            
            /* 【参照画面（feed）】スマホの画面に100%収まるレスポンシブレイアウト */
            <div style={{
              display: 'flex',
              flexWrap: 'wrap', // 🌟スマホの時は自動で縦並びに切り替える魔法
              maxWidth: '1200px',
              margin: '0 auto',
              gap: '20px',      // 🌟距離を 60px から「20px」へ大幅に小さくして左に寄せました
              padding: '0 15px'
            }}>
              
              {/* 左側：あなたのきろく */}
              <section style={{ 
                flex: '1 1 280px', // 🌟最小幅を縮めてスマホの画面内に収めます
                textAlign: 'left'
              }}>
                <h2 style={{ fontSize: '13px', fontWeight: '400', letterSpacing: '2px', color: '#888', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
                  あなたのきろく
                </h2>
                <PostFeed posts={myPosts} />
                
                {/* 戻るボタン */}
                <div style={{ marginTop: '24px' }}>
                  <button 
                    onClick={() => setScreen('record')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textDecoration: 'underline',
                      padding: '0'
                    }}
                  >
                    もどる
                  </button>
                </div>
              </section>

              {/* 右側：みんなのきろく */}
              <section style={{ 
                flex: '1 1 280px', // 🌟こちらもスマホ幅にフィットさせます
                textAlign: 'left'
              }}>
                <h2 style={{ fontSize: '13px', fontWeight: '400', letterSpacing: '2px', color: '#888', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
                  みんなのきろく（リアルタイム）
                </h2>
                <PostFeed posts={everyoneElsePosts} />
              </section>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}