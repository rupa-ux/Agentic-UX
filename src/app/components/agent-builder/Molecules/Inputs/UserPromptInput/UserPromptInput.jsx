import React, { useRef, useEffect, useCallback } from 'react';
import ExpandAllIcon from '../../RHS/RHSHeader/icons/expand_all.svg';
import ExpandAllBtnIcon from '../icons/expand_all.svg';
import BuildIcon from '../icons/build.svg';
import EditNoteIcon from '../icons/edit_note.svg';
import './UserPromptInput.css';

const font = '"Roboto", arial, sans-serif';

const CHIP_CFG = {
  variable: { border: '#d1e5f9', iconBg: '#ecf5fd', iconColor: '#1976d2', icon: 'data_object' },
  tool:     { border: '#ccc',    iconBg: '#efefef', iconColor: '#555',    icon: 'build' },
};

function createChipEl(token) {
  const cfg = CHIP_CFG[token.type] || CHIP_CFG.variable;

  const wrap = document.createElement('span');
  wrap.contentEditable = 'false';
  wrap.setAttribute('data-chip', '1');
  wrap.setAttribute('data-chip-type', token.type);
  wrap.setAttribute('data-chip-label', token.label);
  wrap.style.cssText = [
    'display:inline-flex', 'align-items:center',
    `border:1px solid ${cfg.border}`, 'border-radius:4px',
    'overflow:hidden', 'background:#fff',
    'vertical-align:middle', 'margin:0 2px',
    'cursor:default', 'user-select:none',
  ].join(';');

  const iconEl = document.createElement('span');
  iconEl.className = 'material-symbols-outlined';
  iconEl.style.cssText = [
    'font-size:14px', 'line-height:1', 'padding:2px 4px',
    `background:${cfg.iconBg}`, `border-right:1px solid ${cfg.border}`,
    `color:${cfg.iconColor}`,
    "font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20",
  ].join(';');
  iconEl.textContent = cfg.icon;

  const labelEl = document.createElement('span');
  labelEl.style.cssText = [
    'font-size:12px', 'line-height:16px', 'padding:0 6px',
    'color:#555', 'font-family:"Inter",sans-serif', 'white-space:nowrap',
  ].join(';');
  labelEl.textContent = token.label;

  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('data-chip-close', '1');
  closeBtn.style.cssText = [
    'display:inline-flex', 'align-items:center', 'justify-content:center',
    'background:none', 'border:none', 'padding:2px 4px',
    'cursor:pointer', 'color:#555', 'font-size:16px', 'line-height:1',
  ].join(';');
  closeBtn.textContent = '×';

  wrap.appendChild(iconEl);
  wrap.appendChild(labelEl);
  wrap.appendChild(closeBtn);
  return wrap;
}

function buildDOM(container, tokens) {
  container.innerHTML = '';
  for (const token of tokens) {
    if (token.type === 'text') {
      if (token.value) container.appendChild(document.createTextNode(token.value));
    } else {
      container.appendChild(createChipEl(token));
    }
  }
  updateEmptyAttr(container);
}

function parseDOM(container) {
  const tokens = [];
  for (const node of container.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) tokens.push({ type: 'text', value: node.textContent });
    } else if (node.getAttribute?.('data-chip')) {
      tokens.push({ type: node.getAttribute('data-chip-type'), label: node.getAttribute('data-chip-label') });
    }
  }
  return tokens;
}

function updateEmptyAttr(el) {
  el.setAttribute('data-empty', el.textContent.trim() === '' && !el.querySelector('[data-chip]') ? 'true' : 'false');
}

const TOKEN_RE = /\{\{([^{}]+)\}\}/g;

function convertTextNodesToChips(container) {
  let changed = false;
  for (const node of Array.from(container.childNodes)) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const text = node.textContent;
    if (!TOKEN_RE.test(text)) { TOKEN_RE.lastIndex = 0; continue; }
    TOKEN_RE.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    while ((m = TOKEN_RE.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const inner = m[1];
      const colonIdx = inner.indexOf(':');
      let type, label;
      if (colonIdx !== -1) {
        type  = inner.slice(0, colonIdx).trim().replace(/s$/, ''); // normalise plural → singular
        label = inner.slice(colonIdx + 1).trim();
      } else {
        type  = 'variable';
        label = inner.trim();
      }
      if (!CHIP_CFG[type]) type = 'variable';
      frag.appendChild(createChipEl({ type, label }));
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.replaceWith(frag);
    changed = true;
  }
  return changed;
}

export default function UserPromptInput({ tokens = [], onTokensChange, onFieldIconClick, onToolClick, required, label = 'User prompt' }) {
  const editorRef = useRef(null);
  const tokensRef = useRef(tokens);
  const syncingRef = useRef(false);

  // Mount: build initial DOM
  useEffect(() => {
    buildDOM(editorRef.current, tokens);
    tokensRef.current = tokens;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external token changes (e.g., chip insertion from field picker)
  useEffect(() => {
    if (syncingRef.current) return;
    if (JSON.stringify(tokens) === JSON.stringify(tokensRef.current)) return;

    buildDOM(editorRef.current, tokens);
    tokensRef.current = tokens;

    // Move cursor to end
    const el = editorRef.current;
    if (el && document.activeElement === el) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [tokens]);

  const flush = useCallback(() => {
    syncingRef.current = true;
    const parsed = parseDOM(editorRef.current);
    tokensRef.current = parsed;
    onTokensChange?.(parsed);
    updateEmptyAttr(editorRef.current);
    syncingRef.current = false;
  }, [onTokensChange]);

  const handleInput = (e) => {
    if (convertTextNodesToChips(editorRef.current)) {
      // Move cursor to end of converted content
      const el = editorRef.current;
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    flush();
  };

  const handleClick = (e) => {
    if (e.target.closest('[data-chip-close]')) {
      const chip = e.target.closest('[data-chip]');
      chip?.remove();
      flush();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Backspace') return;
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return;

    let prev = null;
    if (range.startContainer === editorRef.current) {
      prev = editorRef.current.childNodes[range.startOffset - 1];
    } else if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
      prev = range.startContainer.previousSibling;
    }
    if (prev?.getAttribute?.('data-chip')) {
      prev.remove();
      flush();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font, whiteSpace: 'nowrap' }}>
          {label}
        </span>
        {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e5e9f0', borderRadius: 4, boxSizing: 'border-box', background: '#ffffff', width: '100%' }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="up-editor"
          data-placeholder="Enter prompt"
          data-empty="true"
          onInput={handleInput}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          style={{
            minHeight: 44,
            padding: '8px 12px',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '20px',
            letterSpacing: '-0.28px',
            color: '#212121',
            fontFamily: font,
            outline: 'none',
            boxSizing: 'border-box',
            wordBreak: 'break-word',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 11px', height: 44, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={ExpandAllBtnIcon} alt="Insert field" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onFieldIconClick} />
            <img src={BuildIcon} alt="Tools" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onToolClick} />
            <img src={EditNoteIcon} alt="Edit note" style={{ width: 20, height: 20, cursor: 'pointer' }} />
          </div>
          <img src={ExpandAllIcon} alt="Expand" style={{ width: 20, height: 20, transform: 'rotate(90deg)', cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
}
