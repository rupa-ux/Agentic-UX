import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const font = '"Roboto", arial, sans-serif';

const CHIP_VARIANTS = {
  variable: { icon: 'data_object', borderColor: '#d1e5f9', iconBg: '#ecf5fd', iconColor: '#1976d2' },
  tool:     { icon: 'build',       borderColor: '#ccc',    iconBg: '#efefef', iconColor: '#555'    },
  document: { icon: 'draft',       borderColor: '#dcf1d9', iconBg: '#f1faf0', iconColor: '#377e2c' },
  file:     { icon: 'draft',       borderColor: '#dcf1d9', iconBg: '#f1faf0', iconColor: '#377e2c' },
  link:     { icon: 'link',        borderColor: 'rgba(152,0,109,0.2)', iconBg: '#ffe8f8', iconColor: '#98006d' },
};

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function chipHTML(name, type = 'variable') {
  const safe = escHtml(name);
  const safeAttr = safe.replace(/"/g, '&quot;');
  const v = CHIP_VARIANTS[type] ?? CHIP_VARIANTS.variable;
  return (
    `<span class="var-chip" contenteditable="false" data-variable="${safeAttr}" data-variable-type="${type}" ` +
    `style="display:inline-flex;align-items:center;gap:4px;border:1px solid ${v.borderColor};border-radius:4px;` +
    `background:#fff;overflow:hidden;padding:1px 4px 1px 1px;` +
    `vertical-align:middle;margin:0 2px;user-select:none;cursor:default;">` +
    `<span style="display:flex;align-items:center;justify-content:center;width:25px;height:24px;` +
    `background:${v.iconBg};border-right:1px solid ${v.borderColor};flex-shrink:0;">` +
    `<span class="material-symbols-outlined" style="font-size:16px;color:${v.iconColor};line-height:1;">${v.icon}</span>` +
    `</span>` +
    `<span style="font-size:12px;line-height:16px;color:#555555;white-space:nowrap;font-family:${font};">${safe}</span>` +
    `</span>`
  );
}

function toHTML(value) {
  if (!value) return '';
  const parts = value.split(/(\{\{[^}]+\}\})/g);
  return parts.map(part => {
    const m = part.match(/^\{\{([^}]+)\}\}$/);
    if (m) {
      const inner = m[1];
      const colonIdx = inner.indexOf(':');
      if (colonIdx > 0) {
        const type = inner.slice(0, colonIdx);
        const name = inner.slice(colonIdx + 1);
        return chipHTML(name, type);
      }
      return chipHTML(inner, 'variable');
    }
    return escHtml(part).replace(/\n/g, '<br>');
  }).join('');
}

function fromDOM(el) {
  let text = '';
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent.replace(/​/g, '');
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.dataset?.variable !== undefined) {
        const t = node.dataset.variableType;
        text += t && t !== 'variable' ? `{{${t}:${node.dataset.variable}}}` : `{{${node.dataset.variable}}}`;
        return;
      }
      if (node.tagName === 'BR') { text += '\n'; return; }
      node.childNodes.forEach(walk);
      if (node.tagName === 'DIV' || node.tagName === 'P') {
        if (node.nextSibling) text += '\n';
      }
    }
  }
  el.childNodes.forEach(walk);
  return text;
}

function autoConvertPattern(el, onChange) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return;
  const cursorNode = range.startContainer;
  if (cursorNode.nodeType !== Node.TEXT_NODE) return;

  const textBefore = cursorNode.textContent.slice(0, range.startOffset);
  if (!textBefore.endsWith('}}')) return;

  const openIdx = textBefore.lastIndexOf('{{');
  if (openIdx === -1) return;

  const pattern = textBefore.slice(openIdx);
  const m = pattern.match(/^\{\{([^{}]+)\}\}$/);
  if (!m) return;

  const inner = m[1];
  const colonIdx = inner.indexOf(':');
  const type = colonIdx > 0 ? inner.slice(0, colonIdx) : 'variable';
  const name = colonIdx > 0 ? inner.slice(colonIdx + 1) : inner;
  if (!name.trim()) return;

  // Replace the typed text with a chip
  const replaceRange = document.createRange();
  replaceRange.setStart(cursorNode, openIdx);
  replaceRange.setEnd(cursorNode, range.startOffset);
  replaceRange.deleteContents();

  const wrapper = document.createElement('span');
  wrapper.innerHTML = chipHTML(name.trim(), type);
  const chip = wrapper.firstChild;
  const cursor = document.createTextNode('​');
  replaceRange.insertNode(cursor);
  replaceRange.insertNode(chip);

  const newRange = document.createRange();
  newRange.setStartAfter(cursor);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);

  onChange?.({ target: { value: fromDOM(el) } });
}

const VariableRichInput = forwardRef(function VariableRichInput({
  value,
  onChange,
  placeholder,
  style,
}, ref) {
  const divRef = useRef(null);
  const savedRangeRef = useRef(null);
  const isFocused = useRef(false);
  const lastValueRef = useRef(value ?? '');

  useImperativeHandle(ref, () => ({
    insertText(text) {
      const el = divRef.current;
      if (!el) { onChange?.({ target: { value: (value || '') + text } }); return; }
      el.focus();
      const sel = window.getSelection();
      if (savedRangeRef.current) {
        try { sel.removeAllRanges(); sel.addRange(savedRangeRef.current); } catch (_) {}
      }
      const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      const textNode = document.createTextNode(text);
      if (range && el.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(textNode);
      } else {
        el.appendChild(textNode);
      }
      const newRange = document.createRange();
      newRange.setStartAfter(textNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      const newValue = fromDOM(el);
      lastValueRef.current = newValue;
      onChange?.({ target: { value: newValue } });
    },
    insertVariable(name, type = 'variable') {
      const el = divRef.current;
      const serial = type !== 'variable' ? `{{${type}:${name}}}` : `{{${name}}}`;
      if (!el) {
        onChange?.({ target: { value: (value || '') + serial } });
        return;
      }
      el.focus();
      const sel = window.getSelection();
      if (savedRangeRef.current) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        } catch (_) { /* range may be stale */ }
      }
      const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      const wrapper = document.createElement('span');
      wrapper.innerHTML = chipHTML(name, type);
      const chip = wrapper.firstChild;
      const cursor = document.createTextNode('​');
      if (range && el.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(cursor);
        range.insertNode(chip);
      } else {
        el.appendChild(chip);
        el.appendChild(cursor);
      }
      const newRange = document.createRange();
      newRange.setStartAfter(cursor);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      const newValue = fromDOM(el);
      lastValueRef.current = newValue;
      onChange?.({ target: { value: newValue } });
    },
  }));

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    el.innerHTML = toHTML(lastValueRef.current);
  }, []); // mount only

  useEffect(() => {
    if (isFocused.current) return;
    if (value === lastValueRef.current) return;
    const el = divRef.current;
    if (!el) return;
    el.innerHTML = toHTML(value ?? '');
    lastValueRef.current = value ?? '';
  }, [value]);

  function handleInput(e) {
    const newValue = fromDOM(e.currentTarget);
    lastValueRef.current = newValue;
    onChange?.({ target: { value: newValue } });
    autoConvertPattern(e.currentTarget, (evt) => {
      lastValueRef.current = evt.target.value;
      onChange?.(evt);
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const br = document.createElement('br');
      range.insertNode(br);
      const newRange = document.createRange();
      newRange.setStartAfter(br);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      const newValue = fromDOM(e.currentTarget);
      lastValueRef.current = newValue;
      onChange?.({ target: { value: newValue } });
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    const newValue = fromDOM(divRef.current);
    lastValueRef.current = newValue;
    onChange?.({ target: { value: newValue } });
  }

  function handleBlur() {
    isFocused.current = false;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      try { savedRangeRef.current = sel.getRangeAt(0).cloneRange(); } catch (_) {}
    }
  }

  const isEmpty = !value || value === '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {isEmpty && (
        <div style={{
          position: 'absolute', top: 8, left: 12, right: 12,
          fontSize: 14, lineHeight: '20px', color: '#9e9e9e',
          fontFamily: font, pointerEvents: 'none', userSelect: 'none',
        }}>
          {placeholder}
        </div>
      )}
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => { isFocused.current = true; }}
        onBlur={handleBlur}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          padding: '8px 12px',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '20px',
          letterSpacing: '-0.28px',
          color: '#212121',
          fontFamily: font,
          boxSizing: 'border-box',
          background: 'transparent',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          minHeight: 36,
          ...style,
        }}
      />
    </div>
  );
});

export default VariableRichInput;
