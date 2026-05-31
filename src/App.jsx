import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());
  const [screen, setScreen] = useState('record');

  // 1. データを「自分の記録」と「みんなの記録」に綺麗に分ける
  const myPosts = posts.filter((p) => p.author === 'me');
  const everyoneElsePosts = posts.filter((p) => p.author !== 'me');

  const handlePost = useCallback(
    (data) => {
      addPost(data);
      // 投稿したら、今まで通り0.8秒後に一覧画面（feed）に切り替える
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
          {/* 【記録画面】の時は、いままで通りのシンプルな色選び画面 */}
          {screen === 'record' ? (
            <PostComposer colors={palette} onPost={handlePost} />
          ) : (
            
            /* 【参照画面（feed）】になった時に、左右に綺麗に分かれるレイアウト */
            <div style={{
              display: 'flex',
              maxWidth: '1200px',
              margin: '0 auto',
              gap: '60px',
              alignItems: 'flex-start',
              padding: '0 20px'
            }}>
              
              {/* 左側：あなたのきろく */}
              <section style={{ flex: '1', minWidth: '300px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '400', letterSpacing: '2px', color: '#888', marginBottom: '20px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px', textAlign: 'left' }}>
                  あなたのきろく
                </h2>
                <PostFeed posts={myPosts} />
                
                {/* 記録画面に戻るボタンが押しづらくならないよう、下に少し余白をあけます */}
                <div style={{ marginTop: '30px', textAlign: 'left' }}>
                  <button 
                    onClick={() => setScreen('record')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textDecoration: 'underline'
                    }}
                  >
                    もどる
                  </button>
                </div>
              </section>

              {/* 中央の仕切り線 */}
              <div style={{ width: '1px', backgroundColor: '#eee', alignSelf: 'stretch', minHeight: '50vh' }} />

              {/* 右側：みんなのきろく */}
              <section style={{ flex: '1', minWidth: '300px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '400', letterSpacing: '2px', color: '#888', marginBottom: '20px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px', textAlign: 'left' }}>
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