/*
 * ─────────────────────────────────────────────────────────────────────────────
 * Supabase Migration — poet_drafts
 * Run once in the Supabase SQL Editor (or add to supabase/migrations/)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * -- 001_create_poet_drafts.sql
 *
 * create table if not exists public.poet_drafts (
 *   id          uuid primary key default gen_random_uuid(),
 *   user_id     uuid not null references auth.users(id) on delete cascade,
 *   content     text not null default '',
 *   title       text not null default '',
 *   updated_at  timestamptz not null default now(),
 *   version     integer not null default 1
 * );
 *
 * -- Unique per user: one live draft
 * create unique index if not exists poet_drafts_user_id_idx on public.poet_drafts(user_id);
 *
 * -- Row Level Security
 * alter table public.poet_drafts enable row level security;
 *
 * create policy "Poets manage own draft"
 *   on public.poet_drafts
 *   for all
 *   using  (auth.uid() = user_id)
 *   with check (auth.uid() = user_id);
 *
 * -- Enable realtime for this table in the Supabase dashboard:
 * --   Database → Replication → Tables → poet_drafts → toggle ON
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../../../app/lib/supabase';
import { useAuth } from '../../../app/lib/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PoetDraft {
  id: string;
  user_id: string;
  content: string;
  title: string;
  updated_at: string;
  version: number;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Rolling window for WPM calculation in milliseconds */
const WPM_WINDOW_MS = 8_000;

/** Average characters per word (standard WPM convention) */
const CHARS_PER_WORD = 5;

/** WPM below which typing is considered slow/deliberate */
const WPM_SLOW_THRESHOLD = 25;

/** WPM above which typing is considered urgent/fast */
const WPM_FAST_THRESHOLD = 55;

/** Font-weight range for slow typing */
const WEIGHT_SLOW_MIN = 200;
const WEIGHT_SLOW_MAX = 300;

/** Font-weight for balanced/regular typing */
const WEIGHT_REGULAR = 400;

/** Maximum font-weight (urgent typing) */
const WEIGHT_MAX = 700;

/** WPM span used to normalize the fast range */
const WPM_FAST_RANGE = 60;

/** Additional weight added when a key is held down */
const PRESS_BOOST = 30;

/** Duration in ms for the font-weight lerp animation (matches CSS transition) */
const FONT_WEIGHT_TRANSITION_MS = 180;

/** Minimum non-whitespace characters before "send to editorial" is enabled */
const MIN_SUBMISSION_CHARS = 50;

/** Key hold duration in ms before the pressure boost activates */
const KEY_HOLD_THRESHOLD_MS = 300;

// ─── useTypingSpeed ───────────────────────────────────────────────────────────

/**
 * Tracks words-per-minute from raw keystroke timestamps using an 8-second
 * rolling window.  No visible counter — the value feeds font-weight only.
 */
export function useTypingSpeed() {
  const keyTimestamps = useRef<number[]>([]);
  const [wpm, setWpm] = useState(0);

  const recordKeystroke = useCallback(() => {
    const now = Date.now();
    keyTimestamps.current.push(now);

    // Prune timestamps older than the rolling window
    const cutoff = now - WPM_WINDOW_MS;
    keyTimestamps.current = keyTimestamps.current.filter((t) => t >= cutoff);

    // keystrokes ÷ chars-per-word ÷ (window in minutes)
    const count = keyTimestamps.current.length;
    const windowMinutes = WPM_WINDOW_MS / 60_000;
    const computed = count / CHARS_PER_WORD / windowMinutes;
    setWpm(Math.round(computed));
  }, []);

  return { wpm, recordKeystroke };
}

// ─── useVariableFontWeight ────────────────────────────────────────────────────

/**
 * Maps WPM → target font-weight, then lerps toward it over FONT_WEIGHT_TRANSITION_MS.
 * An optional `pressBoost` (from key-hold detection) adds up to +30 micro-weight.
 */
export function useVariableFontWeight(wpm: number, pressBoost: number) {
  const [weight, setWeight] = useState(WEIGHT_SLOW_MAX);
  const animRef = useRef<number | null>(null);
  const currentWeight = useRef(WEIGHT_SLOW_MAX);

  const targetWeight = (() => {
    const base =
      wpm < WPM_SLOW_THRESHOLD
        ? lerp(WEIGHT_SLOW_MIN, WEIGHT_SLOW_MAX, wpm / WPM_SLOW_THRESHOLD)
        : wpm < WPM_FAST_THRESHOLD
          ? lerp(WEIGHT_SLOW_MAX, WEIGHT_REGULAR, (wpm - WPM_SLOW_THRESHOLD) / (WPM_FAST_THRESHOLD - WPM_SLOW_THRESHOLD))
          : lerp(WEIGHT_REGULAR, WEIGHT_MAX, Math.min((wpm - WPM_FAST_THRESHOLD) / WPM_FAST_RANGE, 1));
    return Math.min(WEIGHT_MAX, base + pressBoost);
  })();

  useEffect(() => {
    const startTime = performance.now();
    const from = currentWeight.current;
    const to = targetWeight;
    const duration = FONT_WEIGHT_TRANSITION_MS;

    if (animRef.current !== null) cancelAnimationFrame(animRef.current);

    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // cubic-bezier(0.4, 0, 0.2, 1) approximation via ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const next = from + (to - from) * eased;
      currentWeight.current = next;
      setWeight(next);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [targetWeight]);

  return weight;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// ─── WritingDashboard ─────────────────────────────────────────────────────────

export function WritingDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [authLoading, user, navigate]);

  // Draft state
  const [draftId, setDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const contentRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContent = useRef('');
  const lastSavedTitle = useRef('');

  // Typing speed + font weight
  const { wpm, recordKeystroke } = useTypingSpeed();
  const [pressBoost, setPressBoost] = useState(0);
  const keyHoldTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());  const weight = useVariableFontWeight(wpm, pressBoost);

  // ── Load / create draft ────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    async function loadOrCreateDraft() {
      const { data } = await supabase
        .from('poet_drafts')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data) {
        setDraftId(data.id);
        setTitle(data.title ?? '');
        setContent(data.content ?? '');
        lastSavedContent.current = data.content ?? '';
        lastSavedTitle.current = data.title ?? '';
      } else {
        // Create initial empty draft
        const { data: created } = await supabase
          .from('poet_drafts')
          .insert({ user_id: user!.id, content: '', title: '' })
          .select()
          .single();
        if (created) setDraftId(created.id);
      }
    }

    loadOrCreateDraft();
  }, [user]);

  // Sync contentEditable inner text to state on initial load
  useLayoutEffect(() => {
    if (contentRef.current && content && !contentRef.current.innerText) {
      contentRef.current.innerText = content;
    }
  }, [content]);

  // ── Realtime subscription ──────────────────────────────────────────────────

  useEffect(() => {
    if (!draftId || !user) return;

    const channel = supabase
      .channel(`poet_draft_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'poet_drafts',
          filter: `id=eq.${draftId}`,
        },
        (payload) => {
          const updated = payload.new as PoetDraft;
          // Only apply remote updates if we didn't originate them
          if (updated.content !== lastSavedContent.current) {
            setContent(updated.content);
            if (contentRef.current) contentRef.current.innerText = updated.content;
          }
          if (updated.title !== lastSavedTitle.current) {
            setTitle(updated.title);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [draftId, user]);

  // ── Auto-save (2-second debounce) ──────────────────────────────────────────

  const scheduleSave = useCallback(
    (newContent: string, newTitle: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveStatus('saving');

      saveTimer.current = setTimeout(async () => {
        if (!draftId) return;
        try {
          await supabase
            .from('poet_drafts')
            .update({
              content: newContent,
              title: newTitle,
              updated_at: new Date().toISOString(),
            })
            .eq('id', draftId);

          lastSavedContent.current = newContent;
          lastSavedTitle.current = newTitle;
          setSaveStatus('saved');

          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
          console.error('[WritingDashboard] auto-save failed:', err);
          setSaveStatus('error');
        }
      }, 2000);
    },
    [draftId]
  );

  // ── Keyboard handlers ──────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      recordKeystroke();

      // Key-hold pressure boost: after 300ms continuous hold add +30
      if (!keyHoldTimers.current.has(e.key)) {
        const timer = setTimeout(() => {
          setPressBoost(PRESS_BOOST);
          keyHoldTimers.current.delete(e.key);
        }, KEY_HOLD_THRESHOLD_MS);
        keyHoldTimers.current.set(e.key, timer);
      }
    },
    [recordKeystroke]
  );

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const timer = keyHoldTimers.current.get(e.key);
    if (timer) {
      clearTimeout(timer);
      keyHoldTimers.current.delete(e.key);
    }
    // Fade boost back
    setPressBoost((prev) => (prev > 0 ? 0 : prev));
  }, []);

  const handleInput = useCallback(() => {
    const text = contentRef.current?.innerText ?? '';
    setContent(text);
    scheduleSave(text, title);
  }, [scheduleSave, title]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setTitle(val);
      scheduleSave(content, val);
    },
    [scheduleSave, content]
  );

  // ── Editorial submit ───────────────────────────────────────────────────────

  const canSubmit = content.replace(/\s/g, '').length > MIN_SUBMISSION_CHARS;

  const handleSubmitToEditorial = useCallback(async () => {
    if (!canSubmit || !draftId) return;
    // Mark draft as submitted — teams can filter by this flag
    await supabase
      .from('poet_drafts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', draftId);
    navigate('/garden');
  }, [canSubmit, draftId, navigate]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#faf8f5]">
        <span className="text-sm text-stone-400 tracking-widest animate-pulse">
          entering the garden…
        </span>
      </div>
    );
  }

  if (!user) return null;

  const fontVariationSettings = `"wght" ${weight.toFixed(1)}`;

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#faf8f5] overflow-hidden"
      style={{ fontFamily: "'DM Sans Variable', 'DM Sans', sans-serif" }}
    >
      {/* ── Poem editor styles (font loaded globally in fonts.css) ── */}
      <style>{`
        .poem-editor {
          font-family: 'DM Sans Variable', 'DM Sans', sans-serif;
          font-variation-settings: ${fontVariationSettings};
          transition: font-variation-settings ${FONT_WEIGHT_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          white-space: pre-wrap;
          word-break: break-word;
          caret-color: #6b5e52;
          min-height: 60vh;
        }

        .poem-editor:empty::before {
          content: attr(data-placeholder);
          color: #c4b5a6;
          font-variation-settings: "wght" 200;
          pointer-events: none;
        }

        .title-input::placeholder {
          color: #c4b5a6;
        }
      `}</style>

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
        {/* Left: logo */}
        <Link
          to="/garden"
          className="text-xs tracking-[0.2em] uppercase text-stone-400 hover:text-stone-600 transition-colors"
        >
          the garden
        </Link>

        {/* Center: poem title */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="untitled poem"
          maxLength={120}
          className="title-input flex-1 mx-6 text-center text-xl tracking-wide bg-transparent border-none outline-none text-stone-600 font-normal placeholder:text-stone-300 font-ink"
          style={{ fontFamily: 'var(--font-ink)' }}
          aria-label="Poem title"
        />

        {/* Right: submit */}
        <button
          onClick={handleSubmitToEditorial}
          disabled={!canSubmit}
          className={`
            text-xs tracking-[0.15em] uppercase transition-all duration-200 px-4 py-2 rounded-full
            ${canSubmit
              ? 'text-stone-700 border border-stone-300 hover:border-stone-500 hover:text-stone-900 cursor-pointer'
              : 'text-stone-300 border border-stone-200 cursor-not-allowed'
            }
          `}
        >
          send to editorial
        </button>
      </header>

      {/* ── Poem editor ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            data-placeholder="begin here — let the words find their weight…"
            className="poem-editor text-lg sm:text-xl leading-relaxed text-stone-700 w-full"
            style={{ fontVariationSettings }}
            aria-label="Poem content"
            aria-multiline="true"
            role="textbox"
            spellCheck
          />
        </div>
      </main>

      {/* ── Bottom bar ─────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-center px-6 py-3 shrink-0">
        <span
          className={`text-[11px] tracking-widest uppercase transition-opacity duration-500 ${
            saveStatus === 'idle' ? 'opacity-0' : 'opacity-60'
          } ${saveStatus === 'error' ? 'text-rose-400' : 'text-stone-400'}`}
        >
          {saveStatus === 'saving' && 'saving\u2026'}
          {saveStatus === 'saved' && 'saved'}
          {saveStatus === 'error' && 'could not save'}
        </span>
      </footer>
    </div>
  );
}

export default WritingDashboard;
