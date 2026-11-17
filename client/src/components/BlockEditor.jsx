import { ArrowDown, ArrowUp, Heading2, Pilcrow, Trash2 } from 'lucide-react';
import AutoTextarea from './AutoTextarea.jsx';
import { useBlog } from '../hooks/useBlog.js';

const styles = {
  h2: 'font-sans text-2xl font-bold leading-snug tracking-tight',
  h3: 'font-sans text-xl font-semibold leading-snug',
  p: 'font-copy text-[19px] leading-8',
};
const tagLabel = { h2: 'H2', h3: 'H3', p: '¶' };

function Tool({ label, onClick, children, danger }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      className={`rounded p-1.5 text-slate transition hover:bg-ink/10 ${danger ? 'hover:!text-redpen' : 'hover:text-ink'}`}>
      {children}
    </button>
  );
}

export default function BlockEditor() {
  const { draft, updateBlock, addBlock, removeBlock, moveBlock } = useBlog();
  const { blocks } = draft;

  return (
    <div className="space-y-1">
      {blocks.map((b, i) => (
        <div key={b.id} className="group relative grid grid-cols-[3rem_1fr] gap-2 rounded-lg py-1 focus-within:bg-marker/10">
          <select aria-label="Block type" value={b.type} onChange={(e) => updateBlock(b.id, { type: e.target.value })}
            className="mt-2 h-7 w-12 cursor-pointer appearance-none rounded border border-ink/20 bg-transparent text-center text-xs font-bold text-slate focus:border-ink">
            {Object.entries(tagLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <div>
            <AutoTextarea value={b.text} onChange={(e) => updateBlock(b.id, { text: e.target.value })}
              placeholder={b.type === 'p' ? 'Write a paragraph…' : 'Heading…'}
              className={`w-full bg-transparent px-2 py-1.5 focus:outline-none ${styles[b.type]}`} />
            <div className="flex items-center gap-0.5 px-1 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
              <Tool label="Move up" onClick={() => moveBlock(b.id, -1)}><ArrowUp size={15} /></Tool>
              <Tool label="Move down" onClick={() => moveBlock(b.id, 1)}><ArrowDown size={15} /></Tool>
              <Tool label="Add paragraph below" onClick={() => addBlock(b.id, 'p')}><Pilcrow size={15} /></Tool>
              <Tool label="Add heading below" onClick={() => addBlock(b.id, 'h2')}><Heading2 size={15} /></Tool>
              <Tool label={`Delete block ${i + 1}`} danger onClick={() => removeBlock(b.id)}><Trash2 size={15} /></Tool>
            </div>
          </div>
        </div>
      ))}
      <div className="flex gap-2 pl-14 pt-4">
        <button type="button" className="btn-ghost !py-2" onClick={() => addBlock(null, 'p')}>Add paragraph</button>
        <button type="button" className="btn-ghost !py-2" onClick={() => addBlock(null, 'h2')}>Add heading</button>
      </div>
    </div>
  );
}
