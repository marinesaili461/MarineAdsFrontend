// src/Components/BadgeIcon.jsx
export default function BadgeIcon({ badge, size = 16 }) {
  if (!badge?.imageUrl || badge.hidden) return null;
  return (
    <span title={badge.name} className="inline-flex items-center ml-0.5 align-middle">
      <img
        src={badge.imageUrl}
        alt={badge.name}
        width={size}
        height={size}
        className="rounded-full border-2 border-white object-cover"
      />
    </span>
  );
}
