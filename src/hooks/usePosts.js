import { useCallback, useEffect, useState } from 'react';
import { SEED_POSTS } from '../data/seedPosts.js';
// 🌟全40色をランダムに生み出すために、HSLからHexへの変換とパレットの仕組みをインポートします
import { hslToHex, generatePalette } from '../utils/generateColors.js';

const STORAGE_KEY = 'mood-log-posts-local-solid';

// タグ付き投稿の時のための、それっぽい言葉のプール
const TAGS_POOL = ['わくわく', 'たのしい', 'おなかへった', '天気', 'おちつく', 'のんびり', 'きんちょう', 'ねむい', 'つかれた'];

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function usePosts() {
  const [myPosts, setMyPosts] = useState(loadLocal);
  const [allPosts, setAllPosts] = useState(() => {
    const local = loadLocal();
    return [...local, ...SEED_POSTS];
  });

  // 🌟 15秒ごとに、全40色から完全ランダム ＆ タグあり・なしもランダムに降らせる魔法
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. あなたのアプリが持つ「全40通りのパレット」をその場で1セット生成します
      const currentPalette = generatePalette(); 
      // 2. その40個の中から、完全にランダムに1つの色を選び出します
      const randomColorObj = currentPalette[Math.floor(Math.random() * currentPalette.length)];
      
      // 3. ランダムに選んだ色の「色相(h)」「彩度(s)」「明度(l)」を、Hex形式（#ffffffなど）に100%正しく変換します
      const finalColorHex = hslToHex(randomColorObj.h, randomColorObj.s, randomColorObj.l);

      // 4. 2分の1の確率（50%）で「タグなし」にするか「タグあり」にするかを決めます
      const isTagless = Math.random() < 0.5;
      const assignedTags = isTagless 
        ? [] // タグなしの場合（空の配列）
        : [TAGS_POOL[Math.floor(Math.random() * TAGS_POOL.length)]]; // タグありの場合

      const newDummy = {
        id: `dummy-${Date.now()}`,
        colorHex: finalColorHex, // 🌟全40色から選ばれた正確な色
        tags: assignedTags,      // 🌟ランダムで「あり」か「なし」になったタグ
        createdAt: new Date().toISOString(),
        author: 'someone'
      };

      // 画面の書き換えをReactに強制させます
      setAllPosts(prev => {
        const next = [newDummy, ...prev];
        return next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    }, 15000); // 15秒ごと

    return () => clearInterval(timer);
  }, []);

  // 自分で投稿したときの処理（変更なし・安全）
  const addPost = useCallback(async ({ colorHex, tags }) => {
    const safeTags = Array.isArray(tags) ? tags : [];

    const newPost = {
      id: `me-${Date.now()}`,
      colorHex,
      tags: safeTags,
      createdAt: new Date().toISOString(),
      author: 'me'
    };

    setMyPosts(prev => {
      const next = [newPost, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    setAllPosts(prev => [newPost, ...prev]);

    return newPost;
  }, []);

  const uniquePosts = Array.from(new Map(allPosts.map(p => [p.id, p])).values());

  return { posts: uniquePosts, addPost };
}