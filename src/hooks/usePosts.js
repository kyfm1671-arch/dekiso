import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const STORAGE_KEY = 'mood-log-posts-local-solid';
const FIREBASE_URL = 'https://mood-log-share-default-rtdb.firebaseio.com/posts.json';

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function usePosts() {
  const [myPosts, setMyPosts] = useState(loadLocal);
  const [globalPosts, setGlobalPosts] = useState([]);

  // 1. サーバーからリアルタイムにデータを取得する
  const fetchGlobal = useCallback(async () => {
    try {
      const res = await fetch(FIREBASE_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      const fetched = Object.keys(data).map(key => ({
        id: key,
        colorHex: data[key].colorHex,
        // 🌟【安全装置】みんなのデータにタグがなくてもエラーにしない
        tags: data[key].tags || [], 
        createdAt: data[key].createdAt,
        author: 'someone'
      }));
      setGlobalPosts(fetched);
    } catch (e) {
      console.log("通信スキップ");
    }
  }, []);

  // 1.5秒ごとに超高速自動チェック（自動リロード）
  useEffect(() => {
    fetchGlobal();
    const timer = setInterval(fetchGlobal, 1500);
    return () => clearInterval(timer);
  }, [fetchGlobal]);

  // 合流処理（自分 ＋ みんな ＋ 初期データ）
  const merged = [...myPosts, ...globalPosts, ...SEED_POSTS];
  const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // 2. 投稿したときの処理
  const addPost = useCallback(async ({ colorHex, tags }) => {
    // 🌟【安全装置】もしタグが届かなければ、空の配列にする
    const safeTags = Array.isArray(tags) ? tags : [];

    const newPost = {
      id: `me-${Date.now()}`,
      colorHex,
      tags: safeTags,
      createdAt: new Date().toISOString(),
      author: 'me'
    };

    // まず自分の端末に即座に保存
    setMyPosts(prev => {
      const next = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    // リアルタイム送信
    try {
      await fetch(FIREBASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorHex,
          tags: safeTags,
          createdAt: newPost.createdAt
        })
      });
      fetchGlobal();
    } catch (e) {
      console.error("送信失敗");
    }

    return newPost;
  }, [fetchGlobal]);

  return { posts: uniquePosts, addPost };
}