import { useEffect, useState, useRef } from 'react';
import PostItem from './PostItem.jsx';

export default function PostFeed({ posts }) {
  // 一番新しく追加された投稿のIDを覚えておく場所
  const [latestId, setLatestId] = useState(null);
  // 前回どんなデータだったかを記憶しておくためのメモリー（参照用）
  const prevLengthRef = useRef(posts ? posts.length : 0);
  const prevTopIdRef = useRef(posts && posts[0] ? posts[0].id : null);

  // 🌟データが本当に「増えた瞬間」だけを100%見抜く安全な魔法
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const currentLength = posts.length;
    const currentTopPost = posts[0];

    // 件数が増えた、または一番上のデータのIDが変わった（＝新しいデータが降ってきた）時だけ発動
    if (currentLength > prevLengthRef.current || currentTopPost.id !== prevTopIdRef.current) {
      
      // 本当に新しく降ってきたその1件だけをターゲットにして光らせる！
      setLatestId(currentTopPost.id);
      
      // 3秒経ったら、静かに光の余韻を消す
      const timer = setTimeout(() => {
        setLatestId(null);
      }, 3000);

      // 次回の比較のために、現在の状態をメモリーに保存
      prevLengthRef.current = currentLength;
      prevTopIdRef.current = currentTopPost.id;

      return () => clearTimeout(timer);
    }

    // データ件数が変わっていない（ただ画面を維持しているだけ）ならメモリーだけ更新
    prevLengthRef.current = currentLength;
    prevTopIdRef.current = currentTopPost.id;
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