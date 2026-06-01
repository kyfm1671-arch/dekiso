import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const STORAGE_KEY = 'mood-log-posts-local-solid';

// ランダムに降らせるダミーの色リスト
const DUMMY_COLORS = ['#FF8B8B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#A8DADC', '#457B9D', '#E63946', '#DDA15E', '#9B5DE5'];

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function usePosts() {
  const [myPosts, setMyPosts] = useState(loadLocal);
  // 最初は初期データ（SEED_POSTS）を入れておきます
  const [allPosts, setAllPosts] = useState(() => {
    const local = loadLocal();
    return [...local, ...SEED_POSTS];
  });

  // 🌟 15秒ごとに、画面を100%確実に自動更新させる強力なタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      const randomColor = DUMMY_COLORS[Math.floor(Math.random() * DUMMY_COLORS.length)];
      
      const newDummy = {
        id: `dummy-${Date.now()}`,
        colorHex: randomColor,
        tags: [], // タグなし
        createdAt: new Date().toISOString(),
        author: 'someone' // みんなの記録用
      };

      // 🌟 新しい配列を完全に作り直してセットすることで、Reactに画面の更新を強制します！
      setAllPosts(prev => {
        const next = [newDummy, ...prev];
        // 時間順に綺麗に並び替える
        return next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    }, 15000); // 15秒ごと

    return () => clearInterval(timer);
  }, []);

  // 自分で投稿したときの処理
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const safeTags = Array.isArray(tags) ? tags : [];

    const newPost = {
      id: `me-${Date.now()}`,
      colorHex,
      tags: safeTags,
      createdAt: new Date().toISOString(),
      author: 'me'
    };

    // 自分の端末に即座に保存
    setMyPosts(prev => {
      const next = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    // 🌟 自分の投稿も即座に画面全体のリストにガチッと割り込ませます
    setAllPosts(prev => [newPost, ...prev]);

    return newPost;
  }, []);

  // 重複を綺麗に削ぎ落として最終出力
  const uniquePosts = Array.from(new Map(allPosts.map(p => [p.id, p])).values());

  return { posts: uniquePosts, addPost };
}