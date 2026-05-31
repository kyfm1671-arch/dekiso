import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());

  // 自分の投稿と、他人の投稿（リアルタイム分 ＋ 初期データ）を完全に左右に分ける
  const myPosts = posts.filter(p => p.author === 'me');
  const everyoneElsePosts = posts.filter(p => p.author !== 'me');

  const handlePost = useCallback((data) => {
    addPost(data);
  }, [addPost]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fdfdfd',
      color: '#333333',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <header style={{ marginBottom: '50px', paddingLeft: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '300', letterSpacing: '4px', color: '#555' }}>こころの色</h1>
      </header>

      <main style={{
        display: 'flex',
        maxWidth: '1200px',
        margin: '0 auto',
        gap: '50px',
        alignItems: 'flex-start'
      }}>
        {/* 左側：自分の記録 */}
        <section style={{ flex: '1', minWidth: '280px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '400', letterSpacing: '2px', color: '#888', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
            あなたのきろく
          </h2>
          <div style={{ marginBottom: '30px' }}>
            <PostComposer palette={palette} onPost={handlePost} />
          </div>
          <PostFeed posts={myPosts} />
        </section>

        {/* 中央の境界線 */}
        <div style={{ width: '1px', backgroundColor: '#ebebeb', alignSelf: 'stretch' }} />

        {/* 右側：みんなの記録 */}
        <section style={{ flex: '1', minWidth: '280px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '400', letterSpacing: '2px', color: '#888', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
            みんなのきろく（リアルタイム）
          </h2>
          <PostFeed posts={everyoneElsePosts} />
        </section>
      </main>
    </div>
  );
}