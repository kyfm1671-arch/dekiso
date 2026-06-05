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

  // 1. データベースから投稿を読み込む機能
  const fetchPosts = useCallback(async () => {
    try {
      // 🌟【大改造】自分の記録が押し出されないよう、URLを2つに分けて同時に取得します
      
      // ① みんなの記録（全ユーザーの最新30件）
      const urlEveryone = `${SUPABASE_URL}/rest/v1/posts?select=*&order=created_at.desc&limit=30`;
      
      // ② あなたの記録（あなた[myId]が含まれるデータだけを、件数制限なしで最大1000件取得）
      const urlMine = `${SUPABASE_URL}/rest/v1/posts?select=*&colorHex=ilike.*${myId}*&order=created_at.desc&limit=1000`;

      // 同時にデータベースへ読み込みにいきます
      const [resEveryone, resMine] = await Promise.all([
        fetch(urlEveryone, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
        fetch(urlMine, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } })
      ]);

      if (!resEveryone.ok || !resMine.ok) throw new Error('データ取得失敗');

      const dataEveryone = await resEveryone.json();
      const dataMine = await resMine.json();

      // 重複を防ぐため、2つのデータを合体させて1つのリストにします
      const combinedRawData = [...dataMine, ...dataEveryone];
      
      // IDの重複を取り除く（同じデータが両方にあった場合のため）
      const uniqueRawData = combinedRawData.filter(
        (item, index, self) => self.findIndex(t => t.id === item.id) === index
      );

      // データの整形処理（元々のロジックをそのまま維持）
      const formattedPosts = uniqueRawData.map(post => {
        const parts = (post.colorHex || '').split('|');
        const hex = parts[0] || '#ffffff';
        const senderId = parts[1] || 'unknown';
        const tagsJoinedText = parts[2] || '';

        const restoredTags = tagsJoinedText ? tagsJoinedText.split(',') : [];

        return {
          id: post.id,
          colorHex: hex,
          tags: restoredTags,
          createdAt: post.created_at,
          author: senderId === myId ? 'me' : 'everyone'
        };
      });

      // 日付が新しい順にきれいに並び替えて画面にセット
      formattedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(formattedPosts);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
    }
  }, [myId]);

  // 2. 定期リフレッシュの監視（3秒ごとに自動更新）
  useEffect(() => {
    fetchPosts();
    const backupTimer = setInterval(fetchPosts, 3000);
    return () => clearInterval(backupTimer);
  }, [fetchPosts]);

  // 3. 新しい色をSupabaseに保存（投稿）する機能
  const addPost = useCallback(async ({ colorHex, tags }) => {
    try {
      const safeTags = Array.isArray(tags) ? tags : [];
      const tagsJoinedText = safeTags.join(',');
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