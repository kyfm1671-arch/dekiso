import { useCallback, useState } from 'react';
import PostComposer from './components/PostComposer.jsx';
import PostFeed from './components/PostFeed.jsx';
import { usePosts } from './hooks/usePosts.js';
import { generatePalette } from './utils/generateColors.js';

export default function App() {
  const { posts, addPost } = usePosts();
  const [palette] = useState(() => generatePalette());
  
  // 'record' (記録) | 'feed' (現在のタイムライン) | 'history' (過去の自分の記録)
  const [screen, setScreen] = useState('record');
  const [showCalendar, setShowCalendar] = useState(false);

  // 選択された日付（初期値は今日）
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return (new Date(today - offset)).toISOString().split('T')[0];
  });

  // 一時的に日付を保存しておくためのステート（スマホのピッカー操作用）
  const [tempDate, setTempDate] = useState(selectedDate);

  // 【あなたのきろく】今日の日付のものだけに絞り込み
  const myPosts = posts.filter((p) => {
    if (p.author !== 'me') return false;
    if (!p.createdAt) return false;

    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    const localDate = new Date(p.createdAt);
    const offset = localDate.getTimezoneOffset() * 60000;
    const postDateStr = (new Date(localDate - offset)).toISOString().split('T')[0];

    return postDateStr === todayStr;
  });
  
  // 【みんなのきろく】タグ情報を消去して色のみ、最新30件に制限
  const everyoneElsePosts = posts
    .map((p) => ({
      ...p,
      tags: []
    }))
    .slice(0, 30);

  // カレンダーで選んだ日付の「自分の記録だけ」を抽出
  const historyPosts = posts.filter((p) => {
    if (p.author !== 'me') return false;
    if (!p.createdAt) return false;
    
    const localDate = new Date(p.createdAt);
    const offset = localDate.getTimezoneOffset() * 60000;
    const postDateStr = (new Date(localDate - offset)).toISOString().split('T')[0];

    return postDateStr === selectedDate;
  }).reverse();

  const handlePost = useCallback(
    (data) => {
      addPost(data);
      setTimeout(() => setScreen('feed'), 800);
    },
    [addPost]
  );

  // 🌟 スマホのピッカー内で日付が動かされた時は、データだけを仮保存しておく
  const handleDateChange = (e) => {
    setTempDate(e.target.value);
  };

  // 🌟 スマホの青いチェックマーク（完了）が押されたり、フォーカスが外れた瞬間に画面を切り替える！
  const handleDateConfirm = () => {
    setSelectedDate(tempDate);
    setScreen('history');
  };

  return (
    <div className="app-shell">
      <header className="header">
        <h1 className="app-title">こころの色</h1>
      </header>
      <main className="main">
        <div key={screen} className="screen">
          
          {/* 1. 【記録画面】 */}
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
                きろくを見る →
              </button>
            </div>
          )}

          {/* 2. 【通常の参照画面（feed）】 */}
          {screen === 'feed' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 8px', width: '100%', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
                <button 
                  onClick={() => setScreen('record')}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  ← きろく画面にもどる
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      const nextState = !showCalendar;
                      setShowCalendar(nextState);
                      if (nextState) {
                        setTempDate(selectedDate); // 開いた時に現在の日付を同期
                      }
                    }}
                    style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <span>📅</span> {showCalendar ? '閉じる' : '過去のきろくを振り返る'}
                  </button>

                  {/* 🌟 スマホの青いチェックボタンに対応したinput要素 */}
                  {showCalendar && (
                    <input
                      type="date"
                      value={tempDate}
                      onChange={handleDateChange}
                      onBlur={handleDateConfirm} // 🌟 青いチェックや枠外を押して閉じた瞬間に確定画面へ！
                      style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '20px', fontSize: '11px', color: '#374151', backgroundColor: '#ffffff', cursor: 'pointer' }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '24px', width: '100%' }}>
                <section style={{ flex: '65', width: '65%', minWidth: '0', textAlign: 'left' }}>
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    あなたのきろく（今日）
                  </h2>
                  <PostFeed posts={myPosts} isEveryone={false} />
                </section>

                <section style={{ flex: '35', width: '35%', minWidth: '0', textAlign: 'left' }}>
                  <h2 style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '1px', color: '#888', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
                    みんなのきろく（最新30件）
                  </h2>
                  <PostFeed posts={everyoneElsePosts} isEveryone={true} />
                </section>
              </div>
            </div>
          )}

          {/* 3. 【別画面：指定日の自分のきろく】 */}
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
                <PostFeed posts={historyPosts} isEveryone={false} />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}