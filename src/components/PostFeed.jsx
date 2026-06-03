import { useEffect, useState, useRef } from 'react';
import PostItem from './PostItem.jsx';

export default function PostFeed({ posts }) {
  // 新しく追加されて光らせるべき投稿のIDを覚えておく場所
  const [latestId, setLatestId] = useState(null);
  
  // 「前回の最新の投稿ID」を記憶しておくためのメモリー
  const prevTopIdRef = useRef(null);

  // 初回読み込み時（アプリを開いた瞬間）の古いデータを光らせないためのフラグ
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    // 現在の一番上（最新）のデータのIDを取得
    const currentTopId = posts[0].id;

    // アプリを開いた最初の1回目は、過去のデータを光らせないためにスキップする
    if (isFirstRender.current) {
      prevTopIdRef.current = currentTopId;
      isFirstRender.current = false;
      return;
    }

    // 「前回の最新ID」と「今回の最新ID」が変わった＝【本当に新しいデータが1件追加された】とき
    if (currentTopId !== prevTopIdRef.current) {
      // 新しく降ってきたその1件だけをターゲットにして光らせる！
      setLatestId(currentTopId);
      
      // 3秒経ったら、静かに光の余韻を消す
      const timer = setTimeout(() => {
        setLatestId(null);
      }, 3000);

      // 次回比較するためにメモリーを更新
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