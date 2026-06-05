import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = 'https://hmabpmrcfghpuhpakkrw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NkVNXqW5t450DtRG7bAkkw_EGOLmjzz';

const SENDER_ID_KEY = 'mood-log-sender-uuid';

function getOrCreateSenderId() {
  try {
    let id = localStorage.getItem(SENDER_ID_KEY);
    if (!id) {
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
        const parts = (post.colorHex || '').split('|');
        const hex = parts[0] || '#ffffff';
        const senderId = parts[1] || 'unknown';
        const tagsJoinedText = parts[2] || ''; // カンマ区切りのタグ文字列

        // 🌟【修正】カンマで繋がったテキストを、元のバラバラの配列に戻します
        // 文字列が空っぽの場合は、空の配列（[]）にします
        const restoredTags = tagsJoinedText ? tagsJoinedText.split(',') : [];

        return {
          id: post.id,
          colorHex: hex,
          tags: restoredTags, // 🌟これで複数タグが完全復活！
          createdAt: post.created_at,
          author: senderId === myId ? 'me' : 'everyone'
        };
      });

      setPosts(formattedPosts);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
    }
  }, [myId]);

  // 2. 定期リフレッシュの監視
  useEffect(() => {
    fetchPosts();
    const backupTimer = setInterval(fetchPosts, 3000);
    return () => clearInterval(backupTimer);
  }, [fetchPosts]);

  // 3. 新しい色をSupabaseに保存（投稿）する機能
  const addPost = useCallback(async ({ colorHex, tags }) => {
    try {
      const safeTags = Array.isArray(tags) ? tags : [];
      
      // 🌟【修正】選ばれた複数のタグをカンマ「,」で1本に合体させます（例: "わくわく,たのしい"）
      const tagsJoinedText = safeTags.join(',');

      // 「色コード | 端末ID | 複数合体タグ」の形にして送信します
      const packedData = `${colorHex}|${myId}|${tagsJoinedText}`;

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