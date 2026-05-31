import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';

const STORAGE_KEY = 'mood-log-posts';

function loadMine() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

function loadPosts() {
  const mine = loadMine();
  if (mine.length > 0) {
    return [...mine, ...SEED_POSTS].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  return [...SEED_POSTS].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

function saveMine(posts) {
  const mine = posts.filter((p) => p.author === 'me');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mine));
}

export function usePosts() {
  const [posts, setPosts] = useState(loadPosts);

  useEffect(() => {
    saveMine(posts);
  }, [posts]);

  const addPost = useCallback(({ colorHex, tags }) => {
    const post = {
      id: `me-${Date.now()}`,
      colorHex,
      tags,
      createdAt: new Date().toISOString(),
      author: 'me',
    };
    setPosts((prev) => [post, ...prev]);
    return post;
  }, []);

  return { posts, addPost };
}
