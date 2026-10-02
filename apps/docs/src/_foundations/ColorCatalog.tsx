import { useEffect, useState, type CSSProperties } from 'react';
import {
  colorCatalog,
  type CatalogToken,
  type ColorSection,
  type TokenManifest,
} from './token-manifest';

// Chrome uses only the shared --ds-* contract, so one component renders
// correctly under every brand, and under Biome dark mode.
const chrome: CSSProperties = {
  fontFamily: 'var(--ds-font-body)',
  color: 'var(--ds-text)',
};
const muted: CSSProperties = { fontSize: 12, color: 'var(--ds-text-muted)' };
const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 6,
};
const mono: CSSProperties = { fontSize: 12, overflowWrap: 'anywhere' };
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

type CopyState = 'idle' | 'copied' | 'failed';
const COPY_LABEL: Record<CopyState, string> = {
  idle: 'Copy',
  copied: 'Copied',
  failed: 'Copy failed',
};

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = setTimeout(() => setState('idle'), 1500);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      // Throws when the Clipboard API is missing (insecure context) or denied.
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Copy ${text}`}
        onClick={copy}
        style={{
          font: 'inherit',
          fontSize: 12,
          padding: '2px 8px',
          color: 'var(--ds-text)',
          background: 'transparent',
          border: '1px solid var(--ds-border)',
          borderRadius: 'var(--ds-radius-md)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {COPY_LABEL[state]}
      </button>
      <span role="status" style={visuallyHidden}>
        {state === 'idle' ? '' : `${COPY_LABEL[state]}: ${text}`}
      </span>
    </>
  );
}

/** One platform's name for the token, labelled, with a copy button. */
function PlatformName({
  platform,
  bold = false,
  children,
}: {
  platform: 'Web' | 'RN';
  bold?: boolean;
  children: string;
}) {
  // Web copies a ready-to-use `var(--name)`; RN copies the accessor as shown.
  const copyText = platform === 'Web' ? `var(${children})` : children;
  return (
    <span style={row}>
      <span
        style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}
      >
        <span
          style={{
            ...muted,
            fontSize: 10,
            fontWeight: 700,
            width: 22,
            flexShrink: 0,
          }}
        >
          {platform}
        </span>
        <code style={{ ...mono, fontWeight: bold ? 700 : 400 }}>
          {children}
        </code>
      </span>
      <CopyButton text={copyText} />
    </span>
  );
}

function TokenSwatch({ token, note }: { token: CatalogToken; note?: string }) {
  return (
    <figure
      data-token={token.name}
      style={{
        margin: 0,
        overflow: 'hidden',
        background: 'var(--ds-surface-raised)',
        border: '1px solid var(--ds-border)',
        borderRadius: 'var(--ds-radius-md)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          height: 56,
          background: `var(${token.name})`,
          borderBottom: '1px solid var(--ds-border)',
        }}
      />
      <figcaption style={{ display: 'grid', gap: 4, padding: '8px 10px' }}>
        <PlatformName platform="Web" bold>
          {token.name}
        </PlatformName>
        <PlatformName platform="RN">{token.native.accessor}</PlatformName>
        {note && <span style={muted}>{note}</span>}
        <span style={muted}>
          {token.themeOnly ? 'theme only' : token.value}
          {token.references.length > 0 && ` → ${token.references.join(', ')}`}
        </span>
        {Object.entries(token.overrides).map(([theme, value]) => (
          <span key={theme} style={muted}>
            {theme}: {value}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function Usage({ brand, themes }: { brand: string; themes: string[] }) {
  return (
    <div style={{ ...muted, fontSize: 13, margin: '0 0 28px', maxWidth: 760 }}>
      <p style={{ margin: '0 0 4px' }}>
        Web: <code>var(--name)</code> — the variables ship in{' '}
        <code>@thijulio/{brand}-css</code>.
      </p>
      <p style={{ margin: 0 }}>
        React Native:{' '}
        <code>
          import {'{'} tokens{themes.length > 0 && ', themes, resolve'} {'}'}{' '}
          from '@thijulio/{brand}-tokens/native'
        </code>
        {themes.length > 0 && (
          <>
            {' '}
            — themed values come from <code>
              resolve(tokens, themes.name)
            </code>{' '}
            ({themes.join(', ')}).
          </>
        )}
      </p>
    </div>
  );
}

export function ColorCatalog({
  brand,
  manifest,
  sections,
  notes = {},
}: {
  /** Package brand segment, e.g. `exodus` → `@thijulio/exodus-css`. */
  brand: string;
  manifest: TokenManifest;
  sections: ColorSection[];
  notes?: Record<string, string>;
}) {
  return (
    <div style={chrome}>
      <Usage brand={brand} themes={manifest.themes.map((t) => t.name)} />
      {colorCatalog(manifest, sections).map(({ section, tokens }) => (
        <section key={section.title} style={{ marginBottom: 34 }}>
          <h3 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 2px' }}>
            {section.title}
          </h3>
          {section.description && (
            <p style={{ ...muted, fontSize: 14, margin: '0 0 14px' }}>
              {section.description}
            </p>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 10,
              maxWidth: 1040,
            }}
          >
            {tokens.map((token) => (
              <TokenSwatch
                key={token.name}
                token={token}
                note={notes[token.name]}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
