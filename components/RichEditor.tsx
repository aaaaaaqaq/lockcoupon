'use client';

import { useRef, useCallback } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertImage = () => {
    const url = prompt('URL de l\'image :');
    if (url) exec('insertImage', url);
  };

  const insertLink = () => {
    const url = prompt('URL du lien :');
    if (url) exec('createLink', url);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const ToolBtn = ({ onClick, title, children, active = false }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded text-[14px] transition-colors hover:bg-gray-200 ${active ? 'bg-gray-200 text-text-main' : 'text-muted'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-border px-3 py-2 flex flex-wrap items-center gap-1">
        {/* Text style */}
        <ToolBtn onClick={() => exec('bold')} title="Gras"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italique"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Souligné"><u>U</u></ToolBtn>
        <ToolBtn onClick={() => exec('strikeThrough')} title="Barré"><s>S</s></ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <ToolBtn onClick={() => exec('formatBlock', 'h2')} title="Titre H2"><span className="text-[12px] font-bold">H2</span></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'h3')} title="Sous-titre H3"><span className="text-[12px] font-bold">H3</span></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'p')} title="Paragraphe"><span className="text-[12px]">P</span></ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Liste à puces">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="4" r="1.5"/><rect x="6" y="3" width="9" height="2" rx="1"/><circle cx="3" cy="8" r="1.5"/><rect x="6" y="7" width="9" height="2" rx="1"/><circle cx="3" cy="12" r="1.5"/><rect x="6" y="11" width="9" height="2" rx="1"/></svg>
        </ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Liste numérotée">
          <span className="text-[12px] font-bold">1.</span>
        </ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Align */}
        <ToolBtn onClick={() => exec('justifyLeft')} title="Aligner à gauche">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="6" width="10" height="2" rx="1"/><rect x="1" y="10" width="14" height="2" rx="1"/></svg>
        </ToolBtn>
        <ToolBtn onClick={() => exec('justifyCenter')} title="Centrer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="3" y="6" width="10" height="2" rx="1"/><rect x="1" y="10" width="14" height="2" rx="1"/></svg>
        </ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Media */}
        <ToolBtn onClick={insertLink} title="Insérer un lien">
          <span className="text-[14px]">🔗</span>
        </ToolBtn>
        <ToolBtn onClick={() => exec('unlink')} title="Supprimer le lien">
          <span className="text-[12px]">✂️</span>
        </ToolBtn>
        <ToolBtn onClick={insertImage} title="Insérer une image">
          <span className="text-[14px]">🖼️</span>
        </ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Quote & line */}
        <ToolBtn onClick={() => exec('formatBlock', 'blockquote')} title="Citation">
          <span className="text-[16px]">"</span>
        </ToolBtn>
        <ToolBtn onClick={() => exec('insertHorizontalRule')} title="Ligne horizontale">
          <span className="text-[12px]">—</span>
        </ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Colors */}
        <div className="relative">
          <input
            type="color"
            className="w-8 h-8 rounded cursor-pointer opacity-0 absolute inset-0"
            onChange={(e) => exec('foreColor', e.target.value)}
            title="Couleur du texte"
          />
          <div className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-[14px] pointer-events-none">
            🎨
          </div>
        </div>

        {/* Clear */}
        <ToolBtn onClick={() => exec('removeFormat')} title="Supprimer la mise en forme">
          <span className="text-[12px]">✕</span>
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[350px] max-h-[600px] overflow-y-auto px-5 py-4 text-[15px] text-text-main leading-relaxed outline-none prose prose-sm max-w-none
          [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-text-main
          [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-text-main
          [&_p]:mb-3
          [&_a]:text-primary [&_a]:underline
          [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted [&_blockquote]:my-4
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
          [&_li]:mb-1
          [&_hr]:my-6 [&_hr]:border-border
        "
        data-placeholder="Commencez à écrire votre article ici..."
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #999;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
