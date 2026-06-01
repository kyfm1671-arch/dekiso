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
  
  // 🌟【修正】右側：自分も含めた「すべての投稿（posts）」をそのまま流すように変更しました！
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
            
            /* 【参照画面（feed）】スマホでも横並びをキープするレイアウト */
            <div style={{
              display: 'flex',
              flexWrap: 'nowrap',
              maxWidth: '1200px',
              margin: '0 auto',
              gap: '12px',
              padding: '0 8px',
              width: '100%',
              boxSizing: 'border-box'
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
                
                {/* 戻るボタン */}
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={() => setScreen('record')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline',
                      padding: '0'
                    }}
                  >
                    もどる
                  </button>
                </div>
              </section>

              {/* 右側：みんなのきろく（自分＋生徒全員のリアルタイム） */}
              <section style={{ 
                flex: '1', 
                width: '50%',
                minWidth: '0',
                textAlign: 'left'
              }}>
                <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
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