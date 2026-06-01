import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const STORAGE_KEY = 'mood-log-posts-local-solid';

// 🌟 ダミー投稿用の「色」と、それにぴったり合う「言葉（タグ）」の組み合わせリスト
const DUMMY_POOL = [
  { color: '#FF8B8B', tags: ['わくわく', 'たのしい'] },
  { color: '#FFD166', tags: ['おなかへった', '天気'] },
  { color: '#06D6A0', tags: ['おちつく', 'のんびり'] },
  { color: '#118AB2', tags: ['冷静', '集中'] },
  { color: '#073B4C', tags: ['ねむい', 'つかれた'] },
  { color: '#E63946', tags: ['きんちょう', 'どきどき'] },
  { color: '#9B5DE5', tags: ['おもしろい', 'ひらめき'] },
  { color: '#A8DADC', tags: ['やすみ', '移動'] }
];

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function usePosts() {
  const [myPosts, setMyPosts] = useState(loadLocal);
  const [allPosts, setAllPosts] = useState(() => {
    const local = loadLocal();
    return [...local, ...SEED_POSTS];
  });

  // 🌟 15秒ごとに、色とタグをセットでランダムに降らせる魔法
  useEffect(() => {
    const timer = setInterval(() => {
      // プールの中からランダムに1つのセット（色とタグの候補）を選びます
      const randomSet = DUMMY_POOL[Math.floor(Math.random() * DUMMY_POOL.length)];
      // そのセットが持っているタグの中から、さらにランダムで1つをピックアップします
      const randomTag = randomSet.tags[Math.floor(Math.random() * randomSet.tags.length)];
      
      const newDummy = {
        id: `dummy-${Date.now()}`,
        colorHex: randomSet.color,
        tags: [randomTag], // 🌟 選ばれたタグをしっかり配列に入れてくっつけます
        createdAt: new Date().toISOString(),
        author: 'someone'
      };

      // 画面の書き換えをReactに強制させて、自動で降らせます
      setAllPosts(prev => {
        const next = [newDummy, ...prev];
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

    setMyPosts(prev => {
      const next = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    setAllPosts(prev => [newPost, ...prev]);

    return newPost;
  }, []);

  const uniquePosts = Array.from(new Map(allPosts.map(p => [p.id, p])).values());

  return { posts: uniquePosts, addPost };
}