import { hslToHex, LIGHTNESS_STEPS } from '../utils/generateColors.js';

export default function ColorPicker({
  colors,
  selectedId,
  lightness,
  onSelect,
  onLightnessChange,
}) {
  const selected = colors.find((color) => color.id === selectedId);

  return (
    <div className="color-picker-wrap">
      <div className="color-picker" role="group" aria-label="色を選ぶ">
        {colors.map((color, index) => {
          const isSelected = selectedId === color.id;
          const hex =
            isSelected && lightness != null
              ? hslToHex(color.h, color.s, lightness)
              : color.hex;

          return (
            <button
              key={color.id}
              type="button"
              className={`color-btn${isSelected ? ' is-selected' : ''}`}
              style={{ '--swatch': hex }}
              onClick={() => onSelect(color.id)}
              aria-label={`色 ${index + 1}`}
              aria-pressed={isSelected}
            >
              <span className="color-swatch" />
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="lightness-control">
          <p className="lightness-label">明度</p>
          <div className="lightness-steps" role="group" aria-label="明度を選ぶ">
            {LIGHTNESS_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                className={`lightness-step${lightness === step ? ' is-selected' : ''}`}
                style={{ '--swatch': hslToHex(selected.h, selected.s, step) }}
                onClick={() => onLightnessChange(step)}
                aria-label={`明度 ${step}%`}
                aria-pressed={lightness === step}
              >
                <span className="lightness-swatch" />
                {/* 💡 ココにあった数字を表示するコードを消しました */}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 