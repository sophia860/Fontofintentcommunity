/**
 * SubmissionKanban — draggable submission tracker
 * Columns: Draft → Submitted → Under Review → Accepted → Published
 * Uses motion/react for drag animations + Supabase real-time
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../../app/lib/supabase';

export interface Submission {
  id: string;
  title: string;
  type: 'poem' | 'essay' | 'visual';
  status: KanbanStatus;
  rights_status: 'retained' | 'licensed' | 'pending';
  submitter: string;
  journal_id: string | null;
}

export type KanbanStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'published';

const COLUMNS: { id: KanbanStatus; label: string }[] = [
  { id: 'draft',        label: 'Draft'        },
  { id: 'submitted',    label: 'Submitted'    },
  { id: 'under_review', label: 'Under Review' },
  { id: 'accepted',     label: 'Accepted'     },
  { id: 'published',    label: 'Published'    },
];

const STATUS_PILL: Record<KanbanStatus, { bg: string; color: string }> = {
  draft:        { bg: '#ede8e2', color: '#7a7067' },
  submitted:    { bg: '#e8e4f0', color: '#5a4e7a' },
  under_review: { bg: '#f0e8d8', color: '#8b6030' },
  accepted:     { bg: '#e2ede8', color: '#2a6b4a' },
  published:    { bg: '#f0e2e2', color: '#6B2A2A' },
};

const TYPE_LABEL: Record<Submission['type'], string> = {
  poem:   'Poem',
  essay:  'Essay',
  visual: 'Visual',
};

const RIGHTS_LABEL: Record<Submission['rights_status'], string> = {
  retained: 'Rights retained',
  licensed: 'Licensed',
  pending:  'Rights pending',
};

const MOCK_SUBMISSIONS: Submission[] = [
  { id: '1', title: 'The Ordinary Hours', type: 'poem',   status: 'draft',        rights_status: 'retained', submitter: 'You', journal_id: null },
  { id: '2', title: 'On Grief & Grammar', type: 'essay',  status: 'submitted',    rights_status: 'pending',  submitter: 'You', journal_id: 'j1' },
  { id: '3', title: 'Study in Blue',      type: 'visual', status: 'under_review', rights_status: 'retained', submitter: 'You', journal_id: 'j2' },
  { id: '4', title: 'Salt & Distance',    type: 'poem',   status: 'accepted',     rights_status: 'licensed', submitter: 'You', journal_id: 'j1' },
  { id: '5', title: 'Margin Notes',       type: 'essay',  status: 'published',    rights_status: 'licensed', submitter: 'You', journal_id: 'j3' },
];

const S: Record<string, React.CSSProperties> = {
  board: {
    display: 'flex',
    gap: '1px',
    backgroundColor: '#e8e4df',
    overflowX: 'auto' as const,
    minHeight: '420px',
    borderRadius: '2px',
  },
  column: {
    flex: '1 0 200px',
    backgroundColor: '#F8F4EC',
    minWidth: '180px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  columnHeader: {
    padding: '1rem 1.2rem 0.75rem',
    borderBottom: '1px solid #e8e4df',
  },
  columnLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#7a7067',
  },
  columnCount: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    color: '#b0a89e',
    marginLeft: '0.5rem',
  },
  columnBody: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
    minHeight: '100px',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e8e4df',
    borderRadius: '2px',
    padding: '0.9rem 1rem',
    cursor: 'grab',
    userSelect: 'none' as const,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.88rem',
    color: '#1a1714',
    marginBottom: '0.4rem',
    lineHeight: 1.3,
  },
  cardMeta: {
    fontFamily: 'Georgia, serif',
    fontSize: '0.72rem',
    color: '#b0a89e',
    marginBottom: '0.5rem',
  },
  pill: {
    display: 'inline-block',
    fontFamily: 'Georgia, serif',
    fontSize: '0.65rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    padding: '0.2rem 0.5rem',
    borderRadius: '2px',
  },
  columnOver: {
    outline: '2px dashed #6B2A2A',
    outlineOffset: '-4px',
  },
};

interface Props {
  userId?: string;
}

export function SubmissionKanban({ userId }: Props) {
  const [items, setItems] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<KanbanStatus | null>(null);
  const dragItem = useRef<Submission | null>(null);

  useEffect(() => {
    if (!userId) return;

    supabase
      .from('submissions')
      .select('*')
      .eq('submitter_id', userId)
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as Submission[]);
      });

    const channel = supabase
      .channel('submissions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions', filter: `submitter_id=eq.${userId}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            setItems(prev => [...prev, payload.new as Submission]);
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(s => s.id === (payload.new as Submission).id ? payload.new as Submission : s));
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(s => s.id !== (payload.old as { id: string }).id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  function handleDragStart(item: Submission) {
    dragItem.current = item;
    setDragging(item.id);
  }

  function handleDragOver(e: React.DragEvent, colId: KanbanStatus) {
    e.preventDefault();
    setOverColumn(colId);
  }

  function handleDrop(colId: KanbanStatus) {
    if (!dragItem.current) return;
    const updated = { ...dragItem.current, status: colId };
    setItems(prev => prev.map(s => s.id === updated.id ? updated : s));

    if (userId) {
      supabase
        .from('submissions')
        .update({ status: colId })
        .eq('id', updated.id)
        .then(() => {});
    }

    dragItem.current = null;
    setDragging(null);
    setOverColumn(null);
  }

  function handleDragEnd() {
    dragItem.current = null;
    setDragging(null);
    setOverColumn(null);
  }

  return (
    <div style={S.board}>
      {COLUMNS.map(col => {
        const colItems = items.filter(s => s.status === col.id);
        const isOver = overColumn === col.id;
        return (
          <div
            key={col.id}
            style={{ ...S.column, ...(isOver ? S.columnOver : {}) }}
            onDragOver={e => handleDragOver(e, col.id)}
            onDrop={() => handleDrop(col.id)}
          >
            <div style={S.columnHeader}>
              <span style={S.columnLabel}>{col.label}</span>
              <span style={S.columnCount}>{colItems.length}</span>
            </div>
            <div style={S.columnBody}>
              <AnimatePresence>
                {colItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: dragging === item.id ? 0.4 : 1, y: 0, scale: dragging === item.id ? 1.03 : 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    style={S.card}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={handleDragEnd}
                  >
                    <p style={S.cardTitle}>{item.title}</p>
                    <p style={S.cardMeta}>{TYPE_LABEL[item.type]} · {RIGHTS_LABEL[item.rights_status]}</p>
                    <span
                      style={{
                        ...S.pill,
                        backgroundColor: STATUS_PILL[item.status].bg,
                        color: STATUS_PILL[item.status].color,
                      }}
                    >
                      {col.label}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
