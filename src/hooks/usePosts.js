import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

// あなたのアプリ専用の共有データ置き場（URL）です
// これにより、世界中の端末がこの1つの保管庫を読み書きするようになります
const SHARE_API_URL = 'https://api.keyvalue.xyz/bf92eb6d/mood-log-global-posts';
const LOCAL_STORAGE_KEY = 'mood-log-posts-backup';

// 最初に見せる初期データ
const getInitialPosts = () => {
  return [...SEED_POSTS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export function usePosts() {
  const [posts, setPosts] = useState(getInitialPosts);

  // 1. アプリを開いた時に、ネット上から「みんなの記録」を読み込む
  useEffect(() => {
    async function fetchGlobalPosts() {
      try {
        const response = await fetch(SHARE_API_URL);
        if (response.ok) {
          const globalPosts = await response.json();
          if (Array.isArray(globalPosts) && globalPosts.length > 0) {
            // ネット上のデータと、最初からあるデータを合流させて日付順に並べる
            const merged = [...globalPosts, ...SEED_POSTS];
            // 重複を排除
            const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
            setPosts(unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            return;
          }
        }
      } catch (error) {
        console.log("ネット上のデータ読み込みに失敗、ローカルを使います", error);
      }

      // ネットがダメなら自分のブラウザのバックアップを読み込む
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        try {
          setPosts(JSON.parse(local));
        } catch { /* ignore */ }
      }
    }

    fetchGlobalPosts();
  }, []);

  // 2. 投稿した時に、ネット上の保管庫に保存する
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const newPost = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 他人と被らないID
      colorHex,
      tags,
      createdAt: new Date().toISOString(),
      author: 'someone', // 誰かの投稿として扱う
    };

    // まず自分の画面に即座に反映
    let updatedPosts = [];
    setPosts((prev) => {
      updatedPosts = [newPost, ...prev];
      // バックアップとして自分の端末にも保存
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
      return updatedPosts;
    });

    // インターネット上の保管庫を更新する
    try {
      // 現在のネット上の最新データを一度取得
      const response = await fetch(SHARE_API_URL);
      let currentGlobal = [];
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) currentGlobal = data;
      }
      
      // 新しい投稿を先頭に追加して保存（シードデータ以外をネットに保存）
      const toSave = [newPost, ...currentGlobal].filter(p => !SEED_POSTS.some(s => s.id === p.id));
      // 上限100件までに制限（重くならないようにするため）
      const limited = toSave.slice(0, 100);

      await fetch(SHARE_API_URL, {
        method: 'POST',
        body: JSON.stringify(limited),
      });
    } catch (error) {
      console.error("ネットへの保存に失敗しました", error);
    }

    return newPost;
  }, []);

  return { posts, addPost };
}