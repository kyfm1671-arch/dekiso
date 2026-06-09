import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());
  
  // 画面の状態管理
  // 'record' (記録) | 'feed' (現在のタイムライン) | 'history' (過去の自分の記録)
  const [screen, setScreen] = useState('record');

  const [showCalendar, setShowCalendar] = useState(false);

  // 選択された日付（初期値は今日）
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return (new Date(today - offset)).toISOString().split('T')[0];
  });

  // 🌟【ここを修正】「あなたのきろく」は、今日の日付のものだけに絞り込みます
  const myPosts = posts.filter((p) => {
    if (p.author !== 'me') return false;
    if (!p.createdAt) return false;

    // 現在の「今日の日付（YYYY-MM-DD）」を取得
    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });

    // 投稿の日付（YYYY-MM-DD）を取得
    const localDate = new Date(p.createdAt);
    const offset = localDate.getTimezoneOffset() * 60000;
    const postDateStr = (new Date(localDate - offset)).toISOString().split('T')[0];

    // 今日の日付と一致するものだけを返す
    return postDateStr === todayStr;
  });
  
  // 【みんなのきろく】タグの情報を空っぽにして色のみの共有にする
  const everyoneElsePosts = posts.map((p) => ({
    ...p,
    tags: []
  }));

  // カレンダーで選んだ日付の「自分の記録だけ」を抽出
  const historyPosts = posts.filter((p) => {
    if (p.author !== 'me') return false;
    if (!p.createdAt) return false;
    
    const localDate = new Date(p.createdAt);
    const offset = localDate.getTimezoneOffset() * 60000;
    const postDateStr = (new Date(localDate - offset)).toISOString().split('T')[0];

    return postDateStr === selectedDate;
  });

  const handlePost = useCallback(
    (data) => {
      addPost(data);
      setTimeout(() => setScreen('feed'), 800);
    },
    [addPost]
  );

  // カレンダーの日付がタップされたときの処理
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setScreen('history');
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
            <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
              <PostComposer colors={palette} onPost={handlePost} />
              
              <button
                onClick={() => setScreen('feed')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  width: '100%',
                  justifyContent: 'center',
                  padding: '8px 0'
                }}
              >
                みんなのきろくを見に行く →
              </button>
            </div>
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
                      onChange={handleDateChange}
                      style={{ padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px', color: '#374151', backgroundColor: '#ffffff', cursor: 'pointer' }}
                    />
                  )}
                </div>
              </div>

              {/* 左右の比率（65% : 35%）の記録エリア */}
              <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '24px', width: '100%' }}>
                <section style={{ flex: '65', width: '65%', minWidth: '0', textAlign: 'left' }}>
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    あなたのきろく（今日）
                  </h2>
                  <PostFeed posts={myPosts} />
                </section>

                <section style={{ flex: '35', width: '35%', minWidth: '0', textAlign: 'left' }}>
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    みんなのきろく（リアルタイム）
                  </h2>
                  <PostFeed posts={everyoneElsePosts} />
                </section>
              </div>
            </div>
          )}

          {/* =========================================================
              3. 【別画面：指定日の自分のきろく】
             ========================================================= */}
          {screen === 'history' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
              
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <button 
                  onClick={() => {
                    setShowCalendar(false);
                    setScreen('feed');
                  }}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '8px 0' }}
                >
                  ← リアルタイムの画面にもどる
                </button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  {selectedDate.replace(/-/g, '/')} のあなたのきろく
                </h2>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  カレンダーで選択した日の、あなただけの振り返りページです
                </p>
              </div>

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