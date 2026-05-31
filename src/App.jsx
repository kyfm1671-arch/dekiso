import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());

  const myPosts = posts.filter(p => p.author === 'me');
  const everyoneElsePosts = posts.filter(p => p.author !== 'me');

  const handlePost = useCallback((data) => {
    addPost(data);
  }, [addPost]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdfdfd', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '300', color: '#555', letterSpacing: '2px' }}>こころの色</h1>
      </header>

      <main style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', gap: '40px' }}>
        {/* 左側：自分 */}
        <section style={{ flex: '1' }}>
          <h2 style={{ fontSize: '13px', color: '#888', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>あなたのきろく</h2>
          <div style={{ marginBottom: '20px' }}>
            <PostComposer palette={palette} onPost={handlePost} />
          </div>
          <PostFeed posts={myPosts} />
        </section>

        {/* 真ん中の線 */}
        <div style={{ width: '1px', backgroundColor: '#eee', alignSelf: 'stretch' }} />

        {/* 右側：みんな（リアルタイム） */}
        <section style={{ flex: '1' }}>
          <h2 style={{ fontSize: '13px', color: '#888', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>みんなのきろく（リアルタイム）</h2>
          <PostFeed posts={everyoneElsePosts} />
        </section>
      </main>
    </div>
  );
}