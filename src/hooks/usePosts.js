import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

// 🌟授業用・リアルタイム超高速データ共有の通り道
const API_URL = 'https://api.restful-api.dev/objects';
const GROUP_KEY = 'mood-log-class-2026'; // 授業用の識別キー

const getInitialPosts = () => {
  return [...SEED_POSTS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export function usePosts() {
  const [posts, setPosts] = useState(getInitialPosts);

  // 1. サーバーから最新の「みんなの記録」を読み込む関数
  const fetchGlobalPosts = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const rawData = await response.json();
        
        // このアプリ（授業用キー）のデータだけをフィルターして抽出
        const globalPosts = rawData
          .filter(item => item.name === GROUP_KEY && item.data)
          .map(item => ({
            id: item.id,
            colorHex: item.data.colorHex,
            tags: item.data.tags,
            createdAt: item.data.createdAt,
            author: 'someone'
          }));

        if (globalPosts.length > 0) {
          // 初期データ（シードデータ）と合流させて、新しい順に並べる
          const merged = [...globalPosts, ...SEED_POSTS];
          const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
          setPosts(unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      }
    } catch (error) {
      console.log("データ取得失敗、またはデータがまだありません", error);
    }
  }, []);

  // アプリを開いた時にデータを読み込み、さらに3秒ごとに自動で画面を最新にする（リアルタイム化）
  useEffect(() => {
    fetchGlobalPosts();
    const interval = setInterval(fetchGlobalPosts, 3000); // 3秒ごとに勝手に更新される
    return () => clearInterval(interval);
  }, [fetchGlobalPosts]);

  // 2. 投稿した時に、サーバーに一瞬で送信する
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const newPostData = {
      colorHex,
      tags,
      createdAt: new Date().toISOString(),
    };

    // 自分の画面にサッと先に反映して「余白」を保つ
    const tempId = `me-${Date.now()}`;
    setPosts((prev) => [
      { id: tempId, ...newPostData, author: 'me' },
      ...prev
    ]);

    try {
      // ネット上の共有サーバーに送信
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: GROUP_KEY, // 授業用の部屋に投げ込む
          data: newPostData
        }),
      });
      
      // 送信完了したら、即座にサーバーの最新状態を再読み込み
      fetchGlobalPosts();
    } catch (error) {
      console.error("サーバーへの送信に失敗しました", error);
    }

    return { id: tempId, ...newPostData, author: 'me' };
  }, [fetchGlobalPosts]);

  return { posts, addPost };
}