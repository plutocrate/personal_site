// Placeholder article body: text / image / text / image / text. Image blocks without `src` render a tinted placeholder.
const B = 'The problem was less about features and more about feel. Early prototypes worked, but every interaction asked the person to think about the tool instead of the task.';
const C = 'The final version removes steps instead of adding them. Each detail was tested by using it daily for a few weeks and cutting whatever got in the way.';
export const SOON = ['Notes on how this works will go here once the simulation is finished.', 'Implementation details and what went wrong along the way will follow.'];

export const mk = (a, b = B, c = C) => [
  { type: 'text', text: a },
  { type: 'image' },
  { type: 'text', text: b },
  { type: 'image' },
  { type: 'text', text: c },
];
