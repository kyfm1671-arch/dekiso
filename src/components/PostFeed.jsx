import { useEffect, useState, useRef } from 'react';
import PostItem from './PostItem.jsx';

export default function PostFeed({ posts }) {
  // 新しく追加されて光らせるべき投稿のIDを覚えておく場所
  const [latestId, setLatestId] = useState(null);
  
  // 「前回の最新の投稿ID」を記憶しておくためのメモリー
  const prevTopIdRef = useRef(posts && posts[0] ? posts[0].id : null);

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    // 現在の一番上（最新）のデータ
    const currentTopPost = posts[0];
    const currentTopId = currentTopPost.id;

    // 🌟【ここが超重要】
    // 画面が切り替わった（表示された）瞬間に、一番上のデータが「作られてから1.5秒以内」の生まれたてデータだったら、
    // 画面切り替えのタイムラグに関係なく、強制的にいま投稿されたものとして光らせる！
    const postAgeMs = Date.now() - new Date(currentTopPost.createdAt).getTime();
    
    if (postAgeMs < 1500) {
      setLatestId(currentTopId);
      const timer = setTimeout(() => setLatestId(null), 3000);
      prevTopIdRef.current = currentTopId;
      return () => clearTimeout(timer);
    }

    // 🌟【みんなの自動追加用】
    // すでに画面が開いている状態で、新しく他人のデータが降ってきた場合
    if (currentTopId !== prevTopIdRef.current) {
      setLatestId(currentTopId);
      const timer = setTimeout(() => setLatestId(null), 3000);
      prevTopIdRef.current = currentTopId;
      return () => clearTimeout(timer);
    }
  }, [posts]);

  return (
    <section className="feed" aria-label="みんなの記録">
      {/* フワッと優しく光る演出用のスタイル */}
      <style>{`
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
        .glow-effect {
          animation: softGlow 3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          border-radius: 6px;
        }
      `}</style>

      <ul className="post-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {posts.map((post) => {
          // 今処理しているこの行が「いま増えたばかりの生まれたての記録」かどうかを判定
          const isLatest = post.id === latestId;

          const glowColor = post.colorHex;
          const glowColorLight = post.colorHex + '25'; // ほんのり透き通る色（20%）

          return (
            <li 
              key={post.id} 
              className={isLatest ? 'glow-effect' : ''}
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