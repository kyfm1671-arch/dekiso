import { useState } from 'react';
import { TAGS } from '../data/tags.js';

const MAX_TAGS = 3;

export default function TagSelector({ selected, onChange }) {
  // 💡 ユーザーが自分で新しく追加したタグのリストを覚える場所
  const [customTags, setCustomTags] = useState([]);
  // 💡 いま入力欄に打っている途中の文字を一時的に覚える場所
  const [inputText, setInputText] = useState('');

  // 元からの固定タグ（TAGS）と、自分で作ったタグ（customTags）を合体させて並べます
  const allTags = [...TAGS, ...customTags];

  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
      return;
    }
    if (selected.length >= MAX_TAGS) return;
    onChange([...selected, tag]);
  };

  // 💡 新しいタグを追加ボタンが押された時の処理
  const handleAddTag = (e) => {
    e.preventDefault(); // 画面が勝手にリロードされるのを防ぐおまじない
    const trimmed = inputText.trim();

    // 文字が空っぽじゃなくて、まだ同じタグが存在しない場合だけ追加する
    if (trimmed && !allTags.includes(trimmed)) {
      setCustomTags([...customTags, trimmed]);
      
      // 追加すると同時に、自動的にそのタグを選択状態にする（3個未満なら）
      if (selected.length < MAX_TAGS) {
        onChange([...selected, trimmed]);
      }
      
      setInputText(''); // 入力欄を空っぽに戻す
    }
  };

  return (
    <div className="tag-section">
      <p className="tag-hint">
        タグ {selected.length > 0 ? `${selected.length}/${MAX_TAGS}` : `最大${MAX_TAGS}個`}
      </p>
      
      {/* 既存のタグが丸く並ぶエリア */}
      <div className="tag-list" role="group" aria-label="タグを選ぶ">
        {allTags.map((tag) => {
          const isOn = selected.includes(tag);
          const disabled = !isOn && selected.length >= MAX_TAGS;
          return (
            <button
              key={tag}
              type="button"
              className={`tag-btn${isOn ? ' is-on' : ''}`}
              onClick={() => toggle(tag)}
              disabled={disabled}
              aria-pressed={isOn}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* 💡 タグ一覧の【下の行】に、静かで馴染む入力エリアを配置しました */}
      <form 
        onSubmit={handleAddTag} 
        style={{ 
          marginTop: '16px', 
          display: 'flex', 
          gap: '8px', 
          width: '100%' 
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="新しいタグを入力..."
          style={{
            border: '1px solid #cfcfcf',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '13px',
            outline: 'none',
            flex: 1,
            backgroundColor: 'transparent',
            color: '#333'
          }}
        />
        <button 
          type="submit"
          style={{
            border: '1px solid #333',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '12px',
            backgroundColor: '#333',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          追加
        </button>
      </form>
    </div>
  );
}