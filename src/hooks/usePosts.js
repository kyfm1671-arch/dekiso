import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const STORAGE_KEY = 'mood-log-posts-local-solid';

// 🌟ランダムに降らせるダミーの色と、今回の「タグなし」に合わせた空のタグ
const DUMMY_COLORS = ['#FF8B8B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C', '#A8DADC', '#457B9D', '#E63946', '#DDA15E', '#9B5DE5'];

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function usePosts() {
  const [myPosts, setMyPosts] = useState(loadLocal);
  // 🌟自動で増えていくみんなのきろく（ダミー用）
  const [dummyPosts, setDummyPosts] = useState([]);

  // 1. 15秒ごとに、自動で「誰かの記録」を1件ずつ作成して上に追加していく魔法
  useEffect(() => {
    const createDummyPost = () => {
      const randomColor = DUMMY_COLORS[Math.floor(Math.random() * DUMMY_COLORS.length)];
      
      const newDummy = {
        id: `dummy-${Date.now()}`,
        colorHex: randomColor,
        tags: [], // タグは「なし」の状態でスマートに流します
        createdAt: new Date().toISOString(),
        author: 'someone' // 自分以外の大切な目印
      };

      setDummyPosts(prev => [newDummy, ...prev]);
    };

    // 15秒（15000ミリ秒）ごとに裏側で自動実行
    const timer = setInterval(createDummyPost, 15000);
    return () => clearInterval(timer);
  }, []);

  // 合流処理（自分のきろく ＋ 自動で増えるみんなのきろく ＋ 初期データ）
  const merged = [...myPosts, ...dummyPosts, ...SEED_POSTS];
  const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // 2. 自分が投稿したときの処理
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const safeTags = Array.isArray(tags) ? tags : [];

    const newPost = {
      id: `me-${Date.now()}`,
      colorHex,
      tags: safeTags,
      createdAt: new Date().toISOString(),
      author: 'me'
    };

    // 自分の端末に即座に保存（リロードしても消えません）
    setMyPosts(prev => {
      const next = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    return newPost;
  }, []);

  return { posts: uniquePosts, addPost };
}