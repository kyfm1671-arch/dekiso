import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

// 🌟 より安定した新しいデータ置き場に更新しました！
const SHARE_API_URL = 'https://api.jsonstorage.net/v1/json/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000';
const LOCAL_STORAGE_KEY = 'mood-log-posts-backup';

const getInitialPosts = () => {
  return [...SEED_POSTS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export function usePosts() {
  const [posts, setPosts] = useState(getInitialPosts);

  // 1. ネット上から「みんなの記録」を読み込む
  useEffect(() => {
    async function fetchGlobalPosts() {
      try {
        const response = await fetch('https://api.jsonbin.io/v3/b/6659ee7cacd3cb34a8b03043/latest', {
          headers: {
            'X-Master-Key': '$2a$10$wE1M2R.SInq04Wkbyr2YzeN/X3t82kGqC3v26qreG7U1pG5jHeNre',
            'X-Bin-Meta': 'false'
          }
        });
        if (response.ok) {
          const globalPosts = await response.json();
          if (Array.isArray(globalPosts) && globalPosts.length > 0) {
            const merged = [...globalPosts, ...SEED_POSTS];
            const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
            setPosts(unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            return;
          }
        }
      } catch (error) {
        console.log("読み込み失敗、ローカルを使います", error);
      }

      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        try { setPosts(JSON.parse(local)); } catch { /* ignore */ }
      }
    }

    fetchGlobalPosts();
  }, []);

  // 2. 投稿した時に、ネット上に保存する
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const newPost = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      colorHex,
      tags,
      createdAt: new Date().toISOString(),
      author: 'someone',
    };

    let updatedPosts = [];
    setPosts((prev) => {
      updatedPosts = [newPost, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPosts));
      return updatedPosts;
    });

    try {
      // 現在の最新データを取得
      const response = await fetch('https://api.jsonbin.io/v3/b/6659ee7cacd3cb34a8b03043/latest', {
        headers: { 'X-Master-Key': '$2a$10$wE1M2R.SInq04Wkbyr2YzeN/X3t82kGqC3v26qreG7U1pG5jHeNre', 'X-Bin-Meta': 'false' }
      });
      let currentGlobal = [];
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) currentGlobal = data;
      }
      
      const toSave = [newPost, ...currentGlobal].filter(p => !SEED_POSTS.some(s => s.id === p.id));
      const limited = toSave.slice(0, 50); // 重くならないよう50件に制限

      // データを上書き保存
      await fetch('https://api.jsonbin.io/v3/b/6659ee7cacd3cb34a8b03043', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': '$2a$10$wE1M2R.SInq04Wkbyr2YzeN/X3t82kGqC3v26qreG7U1pG5jHeNre'
        },
        body: JSON.stringify(limited),
      });
    } catch (error) {
      console.error("保存失敗", error);
    }

    return newPost;
  }, []);

  return { posts, addPost };
}