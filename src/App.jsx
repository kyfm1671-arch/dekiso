import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());
  
  // 🌟 画面の状態管理に、新しく 'history' (過去のきろく画面) を追加します
  // 'record' (記録) | 'feed' (現在のタイムライン) | 'history' (過去の自分の記録)
  const [screen, setScreen] = useState('record');

  const [showCalendar, setShowCalendar] = useState(false);

  // 選択された日付（初期値は今日）
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return (new Date(today - offset)).toISOString().split('T')[0];
  });

  // 通常の画面用の仕分け
  const myPosts = posts.filter((p) => p.author === 'me');
  const everyoneElsePosts = posts;

  // 🌟【新機能】カレンダーで選んだ日付の「自分の記録だけ」を抽出する
  const historyPosts = posts.filter((p) => {
    // 自分の投稿であること
    if (p.author !== 'me') return false;
    
    // 投稿の作成日（YYYY-MM-DD部分）と選択された日付が一致するか比較
    const postDate = new Date(p.createdAt).toISOString().split('T')[0];
    return postDate === selectedDate;
  });

  const handlePost = useCallback(
    (data) => {
      addPost(data);
      setTimeout(() => setScreen('feed'), 800);
    },
    [addPost]
  );

  // 🌟【新機能】カレンダーの日付がタップ（変更）されたときの処理
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);   // 日付を更新して
    setScreen('history');       // 🌟「別の画面（過去の自分の記録画面）」にジャンプ！
  };

  return (
    <div className="app-shell">
      <header className="header">
        <h1 className="app-title">こころの色</h1>
      </header>
      <main className="main">
        <div key={screen} className="screen">
          
          {/* =========================================================
              1. 【記録画面】 
             ========================================================= */}
          {screen === 'record' && (
            <PostComposer colors={palette} onPost={handlePost} />
          )}

          {/* =========================================================
              2. 【通常の参照画面（feed）】 
             ========================================================= */}
          {screen === 'feed' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 8px', width: '100%', boxSizing: 'border-box' }}>
              
              {/* もどるボタン と カレンダーボタン */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
                <button 
                  onClick={() => setScreen('record')}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  ← 記録画面にもどる
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <span>📅</span> {showCalendar ? '閉じる' : '過去のきろくを振り返る'}
                  </button>

                  {showCalendar && (
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange} /* 🌟タップしたら画面を切り替える関数を呼び出す */
                      style={{ padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px', color: '#374151', backgroundColor: '#ffffff', cursor: 'pointer' }}
                    />
                  )}
                </div>
              </div>

              {/* 左右のきろくエリア */}
              <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '12px', width: '100%' }}>
                <section style={{ flex: '1', width: '50%', minWidth: '0', textAlign: 'left' }}>
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    あなたのきろく
                  </h2>
                  <PostFeed posts={myPosts} />
                </section>

                <section style={{ flex: '1', width: '50%', minWidth: '0', textAlign: 'left' }}>
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    みんなのきろく（リアルタイム）
                  </h2>
                  <PostFeed posts={everyoneElsePosts} />
                </section>
              </div>
            </div>
          )}

          {/* =========================================================
              3. 🌟【新設：別の画面】カレンダーで選んだ「指定日の自分のきろく」画面
             ========================================================= */}
          {screen === 'history' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
              
              {/* いつでも通常のリアルタイム画面に戻れるボタン */}
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <button 
                  onClick={() => setScreen('feed')} /* 🌟タイムライン画面に戻る */
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 0'
                  }}
                >
                  ← リアルタイムの画面にもどる
                </button>
              </div>

              {/* 指定された日付のタイトル */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  {selectedDate.replace(/-/g, '/')} のあなたのきろく
                </h2>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  カレンダーで選択した日の、あなただけの振り返りページです
                </p>
              </div>

              {/* 🌟 抽出した「その日の自分の記録（historyPosts）」だけを1列で美しく流す */}
              <div style={{ marginTop: '16px' }}>
                <PostFeed posts={historyPosts} />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}