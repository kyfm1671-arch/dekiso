import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const STORAGE_KEY = 'mood-log-posts-v3';

// 🌟自動で降ってくる「みんなの言葉」のバリエーション
const DUMMY_TAGS = [
  ['穏やか', 'ひといき'], ['読書', 'お茶'], ['夜風', '散歩'], 
  ['まったり'], ['すっきり', '集中'], ['おなかいっぱい'], 
  ['つかれた', 'ねむい'], ['ほっと一息'], ['アイデア'], ['音楽']
];
const DUMMY_COLORS = ['#A3B899', '#D3B1C2', '#ECE2D0', '#98B4D4', '#E6A15C', '#88B04B', '#92A8D1', '#F7CAC9'];

function loadMine() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function usePosts() {
  const [myPosts, setMyPosts] = useState(loadMine);
  const [globalPosts, setGlobalPosts] = useState([]);

  // 自分の投稿、自動で降ってくるみんなの投稿、初期データを合流させる
  const merged = [...myPosts, ...globalPosts, ...SEED_POSTS];
  const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // 🌟【心臓部】3〜7秒ごとに、まるで誰かが投稿したかのようにデータを自動生成する
  useEffect(() => {
    const generateFakePost = () => {
      const randomColor = DUMMY_COLORS[Math.floor(Math.random() * DUMMY_COLORS.length)];
      const randomTags = DUMMY_TAGS[Math.floor(Math.random() * DUMMY_TAGS.length)];
      
      const newFakePost = {
        id: `fake-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        colorHex: randomColor,
        tags: randomTags,
        createdAt: new Date().toISOString(),
        author: 'someone' // 右側の「みんなのきろく」に送る
      };

      setGlobalPosts(prev => [newFakePost, ...prev].slice(0, 20)); // 最新20件に絞る

      // 次にデータが降ってくる時間をランダムに決める（3秒〜7秒の間）
      const nextDelay = Math.floor(Math.random() * 4000) + 3000;
      timeoutId = setTimeout(generateFakePost, nextDelay);
    };

    let timeoutId = setTimeout(generateFakePost, 4000); // アプリ起動4秒後に最初の1件目が降ってくる
    return () => clearTimeout(timeoutId);
  }, []);

  // 自分が投稿したときの処理（端末保存）
  const addPost = useCallback(({ colorHex, tags }) => {
    const newPost = {
      id: `me-${Date.now()}`,
      colorHex,
      tags,
      createdAt: new Date().toISOString(),
      author: 'me', // 左側の「あなたのきろく」に送る
    };

    // 100%確実に自分のスマホ（端末）に即時保存
    setMyPosts((prev) => {
      const updated = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newPost;
  }, []);

  return { posts: uniquePosts, addPost };
}