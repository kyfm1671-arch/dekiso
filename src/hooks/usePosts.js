import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const STORAGE_KEY = 'mood-log-posts-local-solid';
// 🌟 筑波大ゲームと同じ、本物のリアルタイムデータベース（Firebase）の通り道です
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

  // 1. サーバーからリアルタイムにデータを取得する（自動リロード用）
  const fetchGlobal = useCallback(async () => {
    try {
      const res = await fetch(FIREBASE_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      // 届いたデータを配列の形に変換
      const fetched = Object.keys(data).map(key => ({
        id: key,
        colorHex: data[key].colorHex,
        tags: data[key].tags,
        createdAt: data[key].createdAt,
        author: 'someone'
      }));
      setGlobalPosts(fetched);
    } catch (e) {
      console.log("通信スキップ");
    }
  }, []);

  // 2. 本物のリアルタイム化：1秒ごとに裏側で超高速チェック（筑波大ゲームと同じ仕組み）
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

  // 3. 投稿したときの処理（まず端末に100%保存 ＋ 即座にネット送信）
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const newPost = {
      id: `me-${Date.now()}`,
      colorHex,
      tags,
      createdAt: new Date().toISOString(),
      author: 'me'
    };

    // 【絶対安全】まず自分の端末に即座に保存（バックアップ復活）
    setMyPosts(prev => {
      const next = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    // 【リアルタイム】送信
    try {
      await fetch(FIREBASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorHex,
          tags,
          createdAt: newPost.createdAt
        })
      });
      fetchGlobal();
    } catch (e) {
      console.error("送信失敗（端末内には保存されています）");
    }

    return newPost;
  }, [fetchGlobal]);

  return { posts: uniquePosts, addPost };
}