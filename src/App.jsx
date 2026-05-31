import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());
  const [screen, setScreen] = useState('record');

  const handlePost = useCallback(
    (data) => {
      addPost(data);
      setTimeout(() => setScreen('feed'), 800);
    },
    [addPost]
  );

  return (
    <div className="App shell">
      <div className="App_container">
        {screen === 'record' ? (
          <>
            <header className="App_header">
              <h1 className="App_title">こころの色</h1>
            </header>
            <main className="App_main">
              <PostComposer palette={palette} onPost={handlePost} />
              <button 
                className="App_navButton"
                onClick={() => setScreen('feed')}
              >
                みんなの記録をみる
              </button>
            </main>
          </>
        ) : (
          <>
            <header className="App_header">
              <button 
                className="App_backButton"
                onClick={() => setScreen('record')}
              >
                ←
              </button>
              <h1 className="App_title">こころの色</h1>
            </header>
            <main className="App_main">
              <div className="App_sectionTitle">みんなの記録</div>
              <PostFeed posts={posts} />
            </main>
          </>
        )}
      </div>
    </div>
  );
}