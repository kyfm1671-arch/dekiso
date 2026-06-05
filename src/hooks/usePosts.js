import { useState, useEffect, useCallback } from 'react';

// 🌟あなたのSupabase情報
const SUPABASE_URL = 'https://hmabpmrcfghpuhpakkrw.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_NkVNXqW5t450DtRG7bAkkw_EGOLmjzz'; 

// 🌟【新機能】スマホ・PCごとに、名前は使わず「匿名の背番号（ユーザーID）」を自動生成して固定する仕組み
const SENDER_ID_KEY = 'mood-log-sender-id-unique';
const getOrCreateSenderId = () => {
  let id = localStorage.getItem(SENDER_ID_KEY);
  if (!id) {
    // ランダムな英数字の組み合わせで、世界に1つだけの端末IDを作ります
    id = `user-${Math.random().toString(36).substring(2, 11)}-${Date.now().toString(36)}`;
    localStorage.setItem(SENDER_ID_KEY, id);
  }
  return id;
};

export function usePosts() {
  const [posts, setPosts] = useState([]);
  // この端末専用のIDを取得して保持
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
      if (!res.ok) throw new Error('データの取得に失敗しました');
      const data = await res.json();
      
      // 画面の仕様に合わせてデータを使いやすい形に変換
      const formattedPosts = data.map(post => ({
        id: post.id,
        colorHex: post.colorHex,
        tags: post.colorName ? [post.colorName] : [], 
        createdAt: post.created_at,
        // 🌟【仕分けのコア】データのauthor列に入っているIDが、このスマホのIDと「一致するかどうか」で自分のものか判別します！
        author: post.author === myId ? 'me' : 'everyone'
      }));

      setPosts(formattedPosts);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
    }
  }, [myId]);

  // 2. 画面が開いたときにデータを読み込み、さらに「リアルタイム監視」を開始する
  useEffect(() => {
    fetchPosts();

    const eventSource = new EventSource(
      `${SUPABASE_URL}/rest/v1/posts?select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const backupTimer = setInterval(fetchPosts, 3000);

    return () => {
      eventSource.close();
      clearInterval(backupTimer);
    };
  }, [fetchPosts]);

  // 3. 新しい色をSupabaseに保存（投稿）する機能
  const addPost = useCallback(async ({ colorHex, tags }) => {
    try {
      const safeTags = Array.isArray(tags) ? tags : [];
      const tagText = safeTags.length > 0 ? safeTags[0] : '';

      const bodyData = {
        colorHex: colorHex,
        colorName: tagText, 
        // 🌟【ここを変更】isMe: true の代わりに、この端末の匿名IDをサーバーへ送信して記録します
        author: myId 
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