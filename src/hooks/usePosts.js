import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

// 🌟【確実なリアルタイム化】データを一元管理して全員に届ける安定した無料の通り道
const STORAGE_KEY = 'mood-log-posts-v2';
const API_URL = 'https://api.jsonbin.io/v3/b/6659ee7cacd3cb34a8b03043';
const MASTER_KEY = '$2a$10$wE1M2R.SInq04Wkbyr2YzeN/X3t82kGqC3v26qreG7U1pG5jHeNre';

function loadMine() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function usePosts() {
  // 起動時はまず100%確実に自分のスマホ内のデータをバックアップから出す
  const [myPosts, setMyPosts] = useState(loadMine);
  const [globalPosts, setGlobalPosts] = useState([]);

  // 自分の投稿、インターネットから届くみんなの投稿、初期データを合流させて新しい順に並べる
  const merged = [...myPosts, ...globalPosts, ...SEED_POSTS];
  const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // 1. サーバーから最新の「みんなの記録」を3秒ごとに自動取得する関数
  const fetchGlobalPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/latest`, {
        headers: {
          'X-Master-Key': MASTER_KEY,
          'X-Bin-Meta': 'false'
        }
      });
      if (response.ok) {
        const rawData = await response.json();
        if (Array.isArray(rawData)) {
          // 自分が投稿した以外のデータを「他人の投稿」として抽出
          const myIds = new Set(myPosts.map(p => p.id));
          const fetched = rawData
            .filter(item => item && item.id && !myIds.has(item.id))
            .map(item => ({
              id: item.id,
              colorHex: item.colorHex,
              tags: item.tags,
              createdAt: item.createdAt,
              author: 'someone' // 右側の「みんなのきろく」に送る
            }));
          setGlobalPosts(fetched);
        }
      }
    } catch (error) {
      console.log("通信エラー。自動リトライします...", error);
    }
  }, [myPosts]);

  // 3秒ごとに勝手に裏側で更新を確認しにいく
  useEffect(() => {
    fetchGlobalPosts();
    const interval = setInterval(fetchGlobalPosts, 3000);
    return () => clearInterval(interval);
  }, [fetchGlobalPosts]);

  // 2. 自分が投稿したときの処理（端末保存 ＋ ネット上へ追加）
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const uniqueId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPost = {
      id: uniqueId,
      colorHex,
      tags,
      createdAt: new Date().toISOString(),
      author: 'me', // 左側の「あなたのきろく」に送る
    };

    // 【1】即座に自分の端末に保存してバックアップを取る
    setMyPosts((prev) => {
      const updated = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // 【2】サーバーの最新データを取得して、自分のデータを混ぜて上書き保存する
    try {
      const res = await fetch(`${API_URL}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Meta': 'false' }
      });
      let currentGlobal = [];
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) currentGlobal = data;
      }

      // 送信用データ作成（データが溢れないよう最新の30件に絞る）
      const cleanPost = { id: newPost.id, colorHex: newPost.colorHex, tags: newPost.tags, createdAt: newPost.createdAt };
      const toSave = [cleanPost, ...currentGlobal].slice(0, 30);

      await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(toSave),
      });

      fetchGlobalPosts();
    } catch (error) {
      console.error("サーバーへのリアルタイム送信に失敗（端末内には保存されています）", error);
    }

    return newPost;
  }, [fetchGlobalPosts]);

  return { posts: uniquePosts, addPost };
}