import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = 'https://hmabpmrcfghpuhpakkrw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NkVNXqW5t450DtRG7bAkkw_EGOLmjzz';

// スマホ・PCごとに、名前は使わず「匿名ID」を割り振って左右を仕分けるキー
const SENDER_ID_KEY = 'mood-log-sender-uuid';

function getOrCreateSenderId() {
  try {
    let id = localStorage.getItem(SENDER_ID_KEY);
    if (!id) {
      // ランダムな英数字の組み合わせで、世界に1つだけの匿名IDを作ります
      id = 'user-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(SENDER_ID_KEY, id);
    }
    return id;
  } catch {
    return 'user-fallback';
  }
}

export function usePosts() {
  const [posts, setPosts] = useState([]);
  // 自分専用のIDを取得して保持
  const [myId] = useState(getOrCreateSenderId);

  // 1. データベースから最新の投稿を読み込む機能
  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/posts?select=*&order=created_at.desc&limit=30`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      if (!res.ok) throw new Error('データ取得失敗');
      const data = await res.json();
      
      const formattedPosts = data.map(post => {
        // 🌟Supabaseの `colorHex` の中に「色コード,端末ID,タグ」を合体させて保存しているため、ここで分解します
        const parts = (post.colorHex || '').split('|');
        const hex = parts[0] || '#ffffff';
        const senderId = parts[1] || 'unknown';
        const tagText = parts[2] || '';

        return {
          id: post.id,
          colorHex: hex,
          tags: tagText ? [tagText] : [], 
          createdAt: post.created_at,
          // 🌟この投稿の端末IDが、自分の端末ID（myId）と一致すれば左側（'me'）へ、違えば右側（'everyone'）へ自動仕分け！
          author: senderId === myId ? 'me' : 'everyone'
        };
      });

      setPosts(formattedPosts);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
    }
  }, [myId]);

  // 2. 画面が開いたときにデータを読み込み、定期リフレッシュ
  useEffect(() => {
    fetchPosts();

    // 確実に同期させるため、3目おきに超高速自動更新を回します
    const backupTimer = setInterval(fetchPosts, 3000);

    return () => {
      clearInterval(backupTimer);
    };
  }, [fetchPosts]);

  // 3. 新しい色をSupabaseに保存（投稿）する機能
  const addPost = useCallback(async ({ colorHex, tags }) => {
    try {
      const safeTags = Array.isArray(tags) ? tags : [];
      const tagText = safeTags.length > 0 ? safeTags[0] : '';

      // 🌟【超裏ワザ】既存の「colorHex」の列に、縦棒（|）で区切って「色コード | 端末ID | タグ」を1本にまとめて送信します！
      // これにより、Supabase側のテーブル設定を一切変更することなく、全てのデータを100%安全に保存できます。
      const packedData = `${colorHex}|${myId}|${tagText}`;

      const bodyData = {
        colorHex: packedData
      };

      await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(bodyData)
      });

      fetchPosts();
    } catch (err) {
      console.error('投稿エラー:', err);
    }
  }, [fetchPosts, myId]);

  return { posts, addPost };
}