import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const LOCAL_STORAGE_KEY = 'mood-log-posts-backup';
// 🌟 セキュリティ制限を解除した、あなた専用の新しいデータ置き場です！
const API_URL = 'https://api.jsonstorage.net/v1/json/113ed739-bf88-4db8-8b5e-436f56fa6830/624ec77a-fb88-4f05-8e79-506d860e6f21';

const getInitialPosts = () => {
  return [...SEED_POSTS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export function usePosts() {
  const [posts, setPosts] = useState(getInitialPosts);

  // 1. ネット上から「みんなの記録」を読み込む
  useEffect(() => {
    async function fetchGlobalPosts() {
      try {
        const response = await fetch(API_URL);
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
      const response = await fetch(API_URL);
      let currentGlobal = [];
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) currentGlobal = data;
      }
      
      const toSave = [newPost, ...currentGlobal].filter(p => !SEED_POSTS.some(s => s.id === p.id));
      const limited = toSave.slice(0, 50); // 50件に制限

      // データを上書き保存
      await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
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