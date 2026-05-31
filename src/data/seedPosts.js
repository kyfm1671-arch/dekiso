const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const SEED_POSTS = [
  {
    id: 'seed-1',
    colorHex: '#B88478',
    tags: ['休み'],
    createdAt: hoursAgo(2),
    author: 'other',
  },
  {
    id: 'seed-2',
    colorHex: '#6A98C8',
    tags: ['天気', '移動'],
    createdAt: hoursAgo(5),
    author: 'other',
  },
  {
    id: 'seed-3',
    colorHex: '#9A9490',
    tags: ['仕事'],
    createdAt: hoursAgo(9),
    author: 'other',
  },
];
