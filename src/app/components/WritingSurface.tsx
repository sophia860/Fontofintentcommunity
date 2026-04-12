/**
 * WritingSurface: the core typing experience.
 *
 * Writing = clean artifact. No ghost traces. Deletions just delete.
 * All keystrokes (including deletions) are recorded in session data
 * so replay can show the full emotional archaeology.
 *
 * Characters are grouped into "typing bursts" — runs of keystrokes
 * at consistent rhythm — and each burst is styled uniformly.
 * This produces readable emotional variation without the "ransom note"
 * effect of per-character styling.
 *
 * At /write: blank new piece.
 * At /piece/:id: loads existing piece body; doFinish() updates it.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import type { Burst, Session, TypingEvent } from '../lib/types';
import {
  createSignalState,
  processKeystroke,
  type SignalState,
} from '../lib/signalProcessor';
import {
  addCharToBursts,
  createBurstBuilderState,
  getAllBursts,
  removeLastCharFromBursts,
  type BurstBuilderState,
} from '../lib/burstDetector';
import { BurstRenderer } from './BurstRenderer';
import { supabase } from '../lib/supabase';

/** State passed back from PreviewScreen when user chooses "Keep Writing" */
export interface WritingSurfaceResumeState {
  bursts: Burst[];
  burstBuilderState: BurstBuilderState;
  events: TypingEvent[];
  textBuffer: string[];
  signalState: SignalState;
  sessionStart: number;
}

type FoiTheme = 'light' | 'dark';

function getStoredTheme(): FoiTheme {
  try {
    const v = localStorage.getItem('foi-theme');
    if (v === 'dark') return 'dark';
  } catch { /* ignore */ }
  return 'light';
}

function storeTheme(t: FoiTheme) {
  try { localStorage.setItem('foi-theme', t); } catch { /* ignore */ }
}

function getIsMobile(): boolean {
  return (
    ('ontouchstart' in window) ||
    window.innerWidth < 640
  );
}

export function WritingSurface() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: pieceId } = useParams<{ id: string }>();

  const resumeState = location.state?.resume as WritingSurfaceResumeState | undefined;

  const [bursts, setBursts] = useState<Burst[]>(resumeState?.bursts ?? []);
  const [events, setEvents] = useState<TypingEvent[]>(resumeState?.events ?? []);
  const [isMac, setIsMac] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<FoiTheme>(getStoredTheme);
  const [firstCharAnim, setFirstCharAnim] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pieceTitle, setPieceTitle] = useState('Untitled');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [loadError, setLoadError] = useState('');

  const signalStateRef = useRef<SignalState>(resumeState?.signalState ?? createSignalState());
  const sessionStartRef = useRef<number>(resumeState?.sessionStart ?? 0);
  const textBufferRef = useRef<string[]>(resumeState?.textBuffer ?? []);
  const eventsRef = useRef<TypingEvent[]>(resumeState?.events ?? []);
  const burstBuilderRef = useRef<BurstBuilderState>(
    resumeState?.burstBuilderState ?? createBurstBuilderState()
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isDark = theme === 'dark';

  // Load existing piece when editing /piece/:id
  useEffect(() => {
    if (!pieceId || resumeState) return;
    async function loadPiece() {
      const { data, error } = await supabase
        .from('writings')
        .select('title, body, tags, state')
        .eq('id', pieceId)
        .single();
      if (error || !data) {
        setLoadError('Piece not found.');
        return;
      }
      setTags((data as { tags?: string[] }).tags ?? []);
      setPieceTitle((data as { title?: string }).title || 'Untitled');
      // Populate text buffer and bursts from existing body
      if ((data as { body?: string }).body) {
        sessionStartRef.current = performance.now();
        const body = (data as { body: string }).body;
        for (const ch of body) {
          const now = performance.now();
          const signal = processKeystroke(signalStateRef.current, now, false);
          textBufferRef.current.push(ch);
          addCharToBursts(burstBuilderRef.current, ch, signal.iki, signal.confidence, signal.hesitation, signal.pause);
        }
        setBursts(getAllBursts(burstBuilderRef.current));
        setEvents([]);
      }
    }
    loadPiece();
  }, [pieceId, resumeState]);

  useEffect(() => {
    inputRef.current?.focus();
    if (!resumeState && !pieceId) {
      sessionStartRef.current = performance.now();
    }
    document.title = 'Font of Intent';
    const platform = navigator.platform || navigator.userAgent || '';
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(platform));
    setIsMobile(getIsMobile());

    const handleResize = () => setIsMobile(getIsMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      storeTheme(next);
      return next;
    });
  }, []);

  const syncBursts = useCallback(() => {
    setBursts(getAllBursts(burstBuilderRef.current));
  }, []);

  /** Insert a character into the session */
  const insertChar = useCallback((char: string) => {
    const now = performance.now();
    const t = now - sessionStartRef.current;
    const signal = processKeystroke(signalStateRef.current, now, false);
    const pos = textBufferRef.current.length;
    const event: TypingEvent = {
      t, type: 'insert', char, pos,
      iki: signal.iki, burst: signal.burst, pause: signal.pause,
      confidence: signal.confidence, hesitation: signal.hesitation,
    };
    setEvents((prev) => [...prev, event]);
    textBufferRef.current.push(char);
    addCharToBursts(
      burstBuilderRef.current, char,
      signal.iki, signal.confidence, signal.hesitation, signal.pause
    );
    syncBursts();
    if (textBufferRef.current.length === 1) {
      setFirstCharAnim(true);
    }
  }, [syncBursts]);

  /** Delete one character */
  const deleteChar = useCallback(() => {
    if (textBufferRef.current.length === 0) return;
    const now = performance.now();
    const t = now - sessionStartRef.current;
    const signal = processKeystroke(signalStateRef.current, now, true);
    const pos = textBufferRef.current.length - 1;
    const event: TypingEvent = {
      t, type: 'delete', pos,
      iki: signal.iki, burst: signal.burst, pause: signal.pause,
      confidence: signal.confidence, hesitation: signal.hesitation,
    };
    setEvents((prev) => [...prev, event]);
    textBufferRef.current.pop();
    removeLastCharFromBursts(burstBuilderRef.current);
    syncBursts();
  }, [syncBursts]);

  /** Delete word backward (iOS swipe-delete) */
  const deleteWordBackward = useCallback(() => {
    if (textBufferRef.current.length === 0) return;
    while (textBufferRef.current.length > 0 && textBufferRef.current[textBufferRef.current.length - 1] === ' ') {
      deleteChar();
    }
    while (textBufferRef.current.length > 0 && textBufferRef.current[textBufferRef.current.length - 1] !== ' ') {
      deleteChar();
    }
  }, [deleteChar]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        deleteChar();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        doFinish();
      } else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        insertChar('\n');
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        insertChar(e.key);
      }
    },
    [insertChar, deleteChar]
  );

  const handleBeforeInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      const ie = e.nativeEvent as InputEvent;
      if (ie.inputType === 'deleteContentBackward') {
        e.preventDefault();
        deleteChar();
      } else if (ie.inputType === 'deleteWordBackward') {
        e.preventDefault();
        deleteWordBackward();
      } else if (ie.inputType === 'insertText' && ie.data) {
        e.preventDefault();
        for (const ch of ie.data) {
          insertChar(ch);
        }
      } else if (ie.inputType === 'insertLineBreak') {
        e.preventDefault();
        insertChar('\n');
      }
    },
    [insertChar, deleteChar, deleteWordBackward]
  );

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const doFinish = useCallback(async () => {
    const finalText = textBufferRef.current.join('');
    const wordCount = finalText.trim().split(/\s+/).filter(Boolean).length;

    const session: Session = {
      startedAt: sessionStartRef.current,
      events: eventsRef.current,
      finalText,
    };

    const currentBursts = getAllBursts(burstBuilderRef.current);
    const copiedBursts = currentBursts.map((b) => ({
      ...b,
      chars: [...b.chars],
      ikis: [...b.ikis],
    }));

    const bbs = burstBuilderRef.current;
    const copiedBuilderState: BurstBuilderState = {
      bursts: bbs.bursts.map((b) => ({
        ...b,
        chars: [...b.chars],
        ikis: [...b.ikis],
      })),
      currentBurst: bbs.currentBurst
        ? {
            ...bbs.currentBurst,
            chars: [...bbs.currentBurst.chars],
            ikis: [...bbs.currentBurst.ikis],
          }
        : null,
    };

    const resume: WritingSurfaceResumeState = {
      bursts: copiedBursts,
      burstBuilderState: copiedBuilderState,
      events: [...eventsRef.current],
      textBuffer: [...textBufferRef.current],
      signalState: {
        ...signalStateRef.current,
        recentIKIs: [...signalStateRef.current.recentIKIs],
      },
      sessionStart: sessionStartRef.current,
    };

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        if (pieceId) {
          await supabase
            .from('writings')
            .update({
              body: finalText,
              word_count: wordCount,
              tags,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pieceId)
            .eq('author_id', user.id);

          setSaving(false);
          navigate('/preview', { state: { session, resumeState: resume, theme, pieceId, savedToGarden: true } });
          return;
        } else {
          const { data: newPiece } = await supabase
            .from('writings')
            .insert({
              title: pieceTitle || 'Untitled',
              body: finalText,
              state: 'seed',
              author_id: user.id,
              word_count: wordCount,
              tags,
              in_bloom_pool: false,
            })
            .select('id')
            .single();

          setSaving(false);
          navigate('/preview', { state: { session, resumeState: resume, theme, pieceId: newPiece?.id, savedToGarden: true } });
          return;
        }
      }
    } catch (err) {
      console.error('Save error:', err);
    }

    setSaving(false);
    navigate('/preview', { state: { session, resumeState: resume, theme, savedToGarden: false } });
  }, [navigate, theme, pieceId, pieceTitle, tags]);

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  const hasContent = bursts.length > 0;

  // Theme-dependent colors
  const bg = isDark ? '#1C1915' : '#F5EDE4';
  const backColor = isDark ? '#A89B8E' : '#8B7E74';
  const backHover = isDark ? '#F0E8DE' : '#5C524A';
  const hintColor = isDark ? '#A89B8E' : '#A09486';
  const placeholderColor = isDark ? '#7A6E62' : '#A09486';
  const cursorColor = isDark ? '#C4896A' : '#B87A5E';
  const toggleColor = isDark ? '#A89B8E' : '#8B7E74';
  const finishColor = isDark ? '#F0E8DE' : '#2C2824';
  const finishUnderline = isDark ? '#5C5347' : '#C4B5A6';
  const finishUnderlineHover = isDark ? '#F0E8DE' : '#2C2824';
  const dotColor = isDark ? '#5C5347' : '#C4B5A6';
  const doneBorderColor = isDark ? '#8B7E74' : '#8B7E74';
  const tagBg = isDark ? '#2A2520' : '#FFFDF8';
  const tagBorder = isDark ? '#5C5347' : '#C4B5A6';
  const tagText = isDark ? '#A89B8E' : '#7a7067';

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center" style={{ background: bg }}>
        <p style={{ fontFamily: 'Georgia, serif', color: hintColor, marginBottom: '1rem' }}>{loadError}</p>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif', color: finishColor, fontSize: '0.9rem' }}
        >
          Back to Garden
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: bg, transition: 'background-color 0.3s ease' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top bar — back left, toggle + finish right */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 md:px-10 md:py-6">
        {/* Back — top-left */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate(-1); }}
          className="cursor-pointer"
          style={{
            background: 'none',
            border: 'none',
            padding: isMobile ? '0.5rem' : 0,
            fontFamily: "'Inter', sans-serif",
            fontVariationSettings: "'wght' 400",
            fontSize: isMobile ? '0.85rem' : '0.75rem',
            letterSpacing: '0.04em',
            color: backColor,
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = backHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = backColor;
          }}
        >
          back
        </button>

        {/* Right side — toggle · tags · finish (desktop) */}
        {!isMobile && (
          <div className="flex items-center">
            <button
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              className="cursor-pointer"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: toggleColor,
                fontFamily: "'Inter', sans-serif",
                fontVariationSettings: "'wght' 400",
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = finishColor; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = toggleColor; }}
            >
              {isDark ? 'light' : 'dark'}
            </button>

            {hasContent && (
              <>
                <span className="mx-3" style={{ fontSize: '0.65rem', color: dotColor }}>{'\u00b7'}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowTagInput(v => !v); }}
                  className="cursor-pointer"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: showTagInput ? finishColor : toggleColor,
                    fontFamily: "'Inter', sans-serif",
                    fontVariationSettings: "'wght' 400",
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  tags{tags.length > 0 ? ` (${tags.length})` : ''}
                </button>
                <span className="mx-3" style={{ fontSize: '0.65rem', color: dotColor }}>{'\u00b7'}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); doFinish(); }}
                  disabled={saving}
                  className="cursor-pointer"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: finishColor,
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: '0.85rem',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  <span
                    style={{
                      paddingBottom: '2px',
                      borderBottom: `1px solid ${finishUnderline}`,
                      transition: 'border-color 0.3s ease',
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.borderBottomColor = finishUnderlineHover; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.borderBottomColor = finishUnderline; }}
                  >
                    {saving ? 'Saving\u2026' : (pieceId ? 'Save' : 'Add to the Garden')} {saving ? '' : '\u2192'}
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Mobile: theme toggle only */}
        {isMobile && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
            className="cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              color: toggleColor,
              fontFamily: "'Inter', sans-serif",
              fontVariationSettings: "'wght' 400",
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isDark ? 'light' : 'dark'}
          </button>
        )}
      </div>

      {/* Tag input panel */}
      {showTagInput && (
        <div
          className="relative z-10"
          style={{
            padding: '0.75rem max(1rem, 2.5rem)',
            borderBottom: `1px solid ${tagBorder}`,
            backgroundColor: tagBg,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em',
                  color: tagText,
                  border: `1px solid ${tagBorder}`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 2px', color: tagText, fontSize: '0.75rem', lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
              }}
              placeholder="Add tag…"
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.78rem',
                color: finishColor,
                width: '120px',
              }}
            />
          </div>
        </div>
      )}

      {/* Mobile: Add to the Garden bar */}
      {isMobile && hasContent && (
        <div
          className="relative z-10"
          style={{
            padding: '0 1rem',
            marginBottom: '0.5rem',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); doFinish(); }}
            disabled={saving}
            className="cursor-pointer w-full"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 1rem',
              textAlign: 'right',
              color: finishColor,
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '1rem',
              minHeight: '44px',
              display: 'block',
              transition: 'color 0.2s',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <span
              style={{
                paddingBottom: '2px',
                borderBottom: `1px solid ${finishUnderline}`,
              }}
            >
              {saving ? 'Saving\u2026' : (pieceId ? 'Save' : 'Add to the Garden')} {saving ? '' : '\u2192'}
            </span>
          </button>
        </div>
      )}

      {/* Writing area — vertically centered, entrance animation */}
      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-12"
        style={{
          animation: 'foiEntrance 800ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        <div className="w-full" style={{ maxWidth: '42rem' }}>
          <div
            className="whitespace-pre-wrap break-words"
            style={{
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {bursts.length === 0 && (
              <span
                className="select-none"
                style={{
                  color: placeholderColor,
                  fontFamily: "'DM Sans', sans-serif",
                  fontVariationSettings: "'wght' 350",
                  fontSize: '1.05rem',
                  transition: 'color 0.3s ease',
                }}
              >
                type naturally{'\n'}your rhythm shapes the typography
              </span>
            )}
            {bursts.length === 0 && <br />}
            <span
              style={{
                display: 'inline',
                animation: firstCharAnim ? 'foiFirstChar 250ms ease-out both' : 'none',
              }}
              onAnimationEnd={() => setFirstCharAnim(false)}
            >
              <BurstRenderer
                bursts={bursts}
                inline
                darkMode={isDark}
                suffix={
                  <span
                    className="inline-block w-[2px] ml-[1px]"
                    style={{
                      height: '1.2em',
                      verticalAlign: 'text-bottom',
                      background: cursorColor,
                      animation: 'foiCursorBlink 1.2s ease-in-out infinite',
                    }}
                  />
                }
              />
            </span>
          </div>
        </div>

        {/* Hidden textarea for keyboard capture */}
        <textarea
          ref={inputRef}
          className="absolute opacity-0 pointer-events-auto"
          style={{ width: '1px', height: '1px', top: 0, left: 0 }}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          autoFocus
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Write a piece for the Garden"
        />
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 flex items-end justify-center px-4 pb-4 sm:px-6 sm:pb-6 md:px-10 md:pb-8">
        {isMobile ? (
          <button
            onClick={(e) => { e.stopPropagation(); doFinish(); }}
            disabled={saving}
            className="cursor-pointer"
            style={{
              background: 'none',
              border: `1px solid ${doneBorderColor}`,
              padding: '0.75rem 2rem',
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '1rem',
              color: finishColor,
              minHeight: '44px',
              transition: 'border-color 0.3s ease, color 0.3s ease',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving\u2026' : 'Done'}
          </button>
        ) : (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontVariationSettings: "'wght' 400",
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              color: hintColor,
              transition: 'color 0.3s ease',
            }}
          >
            {isMac ? '\u2318' : 'Ctrl'}+Enter to add to the Garden
          </p>
        )}
      </div>

      <style>{`
        @keyframes foiEntrance {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes foiCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes foiFirstChar {
          from { transform: scale(1.06); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
