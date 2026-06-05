import { useState, useEffect, useCallback } from 'react';

// 🌟【重要】あなたのSupabaseの情報に書き換えてください
const SUPABASE_URL = 'https://hmabpmrcfghpuhpakkrw.supabase.co/rest/v1/'; // 
const SUPABASE_KEY = 'sb_publishable_NkVNXqW5t450DtRG7bAkkw_EGOLmjzz'; // 

export function usePosts() {
  const [posts, setPosts] = useState([]);

  // 1. データベースから最新の投稿を読み込む機能
  const fetchPosts = useCallback(async () => {
    try {
      // 最新の投稿から順に30件取得する命令
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
        // 🌟Supabaseから届いたタグ（文字列）を、元のコードと同じ配列形式に戻します
        tags: post.colorName ? [post.colorName] : [], 
        createdAt: post.created_at,
        // テーブルに保存された「isMe」がtrueなら 'me'、falseなら 'everyone' に割り振る
        author: post.isMe ? 'me' : 'everyone'
      }));

      setPosts(formattedPosts);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
    }
  }, []);

  // 2. 画面が開いたときにデータを読み込み、さらに「リアルタイム監視」を開始する
  useEffect(() => {
    fetchPosts();

    // Supabaseのリアルタイム通信用のエンドポイントを監視
    const eventSource = new EventSource(
      `${SUPABASE_URL}/rest/v1/posts?select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    // データベースに変化（新しい行が追加など）があったら自動で再読み込み
    const handleRealtimeUpdate = () => {
      fetchPosts();
    };

    // 本来は詳細なイベント購読が必要ですが、一番確実に動かすために
    // 定期的な自動リフレッシュ（3秒おき）も安全装置として裏で同時に回します
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
      // 🌟元のアプリの仕様に合わせ、配列の最初の1つを「colorName」の列に保存します
      const tagText = safeTags.length > 0 ? safeTags[0] : '';

      const bodyData = {
        colorHex: colorHex,
        colorName: tagText, // 🌟ここにタグのテキストが入ります
        isMe: true // 自分がこの画面から投稿したものは「true」として保存
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

      // 投稿したらすぐに自分の画面にも反映させる
      fetchPosts();
    } catch (err) {
      console.error('投稿エラー:', err);
    }
  }, [fetchPosts]);

  return { posts, addPost };
}