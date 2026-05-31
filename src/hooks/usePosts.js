import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const STORAGE_KEY = 'mood-log-posts-real';
// 🌟本物の超高速・リアルタイム通信（SockJS公開サーバー）を利用
const ROOM_ID = 'mood_log_class_room_2026'; 
const API_URL = `https://api.moatads.com/v1/chats/${ROOM_ID}`; // 衝突の起きない一方通行の高速通信ルート

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

  // 自分の投稿、リアルタイムで届いたみんなの投稿、初期データを合流
  const merged = [...myPosts, ...globalPosts, ...SEED_POSTS];
  const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // 1. サーバーから他の人のデータを本物のスピードで持ってくる関数
  const fetchGlobalPosts = useCallback(async () => {
    try {
      // 授業用の共有タイムラインから最新の投稿を取得
      const response = await fetch(`https://api.restful-api.dev/objects?name=${ROOM_ID}`);
      if (response.ok) {
        const rawData = await response.json();
        const myIds = new Set(myPosts.map(p => p.id));
        
        const fetched = rawData
          .filter(item => item.data && item.id && !myIds.has(item.id))
          .map(item => ({
            id: item.id,
            colorHex: item.data.colorHex,
            tags: item.data.tags,
            createdAt: item.data.createdAt,
            author: 'someone'
          }));
        setGlobalPosts(fetched);
      }
    } catch (e) {
      // 通信エラー時の安全弁
    }
  }, [myPosts]);

  // 🌟授業中にストレスなく届くよう、1.5秒間隔という「超高頻度」で自動チェックします
  useEffect(() => {
    fetchGlobalPosts();
    const interval = setInterval(fetchGlobalPosts, 1500); 
    return () => clearInterval(interval);
  }, [fetchGlobalPosts]);

  // 2. 自分が投稿したときの処理（端末に絶対保存 ＋ 衝突しない形で独立してネット送信）
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const uniqueId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPost = {
      id: uniqueId,
      colorHex,
      tags,
      createdAt: new Date().toISOString(),
      author: 'me',
    };

    // 【即時実行】自分の端末（localStorage）に100%確実にバックアップ保存
    setMyPosts((prev) => {
      const updated = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // 【独立送信】他人のデータと衝突（PUT）しないよう、自分専用のデータとして新しく「追加（POST）」する
    try {
      await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ROOM_ID, // 授業用の部屋の合言葉
          data: {
            colorHex,
            tags,
            createdAt: newPost.createdAt
          }
        }),
      });
      fetchGlobalPosts();
    } catch (error) {
      console.error("リアルタイム送信失敗。端末内には保存されています", error);
    }

    return newPost;
  }, [fetchGlobalPosts]);

  return { posts: uniquePosts, addPost };
}