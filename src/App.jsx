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
            
            /* 【参照画面（feed）】スマホでも絶対に横並びをキープするレイアウト */
            <div style={{
              display: 'flex',
              flexWrap: 'nowrap', // 🌟 絶対に縦に折り返さない（横並びを死守する）魔法
              maxWidth: '1200px',
              margin: '0 auto',
              gap: '12px',        // 🌟 距離を限界まで縮めて「12px」に。みんなの記録が左に寄ります
              padding: '0 8px',   // 左右の端の余白も少し削って画面を広く使います
              width: '100%',
              boxSizing: 'border-box'
            }}>
              
              {/* 左側：あなたのきろく（画面の約半分を使う） */}
              <section style={{ 
                flex: '1', 
                width: '50%',     // 🌟 スマホ画面のちょうど半分の幅に設定
                minWidth: '0',     // 横へのはみ出しを強制ストップする設定
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

              {/* 右側：みんなのきろく（残りの半分を使う） */}
              <section style={{ 
                flex: '1', 
                width: '50%',     // 🌟 スマホ画面のちょうど半分の幅に設定
                minWidth: '0',     // 横へのはみ出しを強制ストップする設定
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