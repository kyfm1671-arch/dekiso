import { useState } from 'react';
import ColorPicker from './ColorPicker.jsx';
import TagSelector from './TagSelector.jsx';
import { hslToHex } from '../utils/generateColors.js';

export default function PostComposer({ colors, onPost }) {
  const [colorId, setColorId] = useState(null);
  const [lightness, setLightness] = useState(null);
  const [tags, setTags] = useState([]);
  const [posted, setPosted] = useState(false);

  const selected = colors.find((color) => color.id === colorId);
  // 🌟【修正】タグが選ばれていなくても、色と明るささえ選ばれていればボタンを押せるようにしました！
  const canPost = selected && lightness != null;

  const handleSelect = (id) => {
    const color = colors.find((item) => item.id === id);
    setColorId(id);
    setLightness(color.l);
  };

  const handlePost = () => {
    if (!canPost) return;
    onPost({
      colorHex: hslToHex(selected.h, selected.s, lightness),
      tags, // タグは空っぽ（[]）のまま後ろへ渡されます
    });
    setColorId(null);
    setLightness(null);
    setTags([]);
    setPosted(true);
    setTimeout(() => setPosted(false), 1200);
  };

  return (
    <section className="composer" aria-label="記録する">
      <ColorPicker
        colors={colors}
        selectedId={colorId}
        lightness={lightness}
        onSelect={handleSelect}
        onLightnessChange={setLightness}
      />
      <TagSelector selected={tags} onChange={setTags} />
      <button
        type="button"
        className="post-btn"
        onClick={handlePost}
        disabled={!canPost}
      >
        {posted ? '記録した' : '記録する'}
      </button>
    </section>
  );
}