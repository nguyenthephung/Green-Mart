import React, { useState, useRef, useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  maxHeight?: string;
}

interface EditorSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'table';
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Nhập nội dung...",
  className = "",
  readOnly = false,
  maxHeight = "400px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [sections, setSections] = useState<EditorSection[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Toolbar actions
  const formatText = useCallback((command: string, value?: string) => {
    if (readOnly) return;
    
    document.execCommand(command, false, value);
    
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  }, [onChange, readOnly]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  }, [onChange]);

  // Handle keydown events for better image deletion
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readOnly) return;

    // Handle Delete and Backspace for image deletion
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedElement = range.commonAncestorContainer;
        
        // Check if an image is selected
        let imgElement: HTMLImageElement | null = null;
        
        if (selectedElement.nodeType === Node.ELEMENT_NODE) {
          const element = selectedElement as Element;
          if (element.tagName === 'IMG') {
            imgElement = element as HTMLImageElement;
          } else {
            imgElement = element.querySelector('img');
          }
        } else if (selectedElement.parentElement?.tagName === 'IMG') {
          imgElement = selectedElement.parentElement as HTMLImageElement;
        }

        // If an image is found and selected, delete it
        if (imgElement) {
          e.preventDefault();
          imgElement.remove();
          handleContentChange();
          return;
        }
      }
    }
  }, [readOnly, handleContentChange]);

  // Handle click events on images to make them selectable
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;

    const target = e.target as Element;
    if (target.tagName === 'IMG') {
      // Select the image
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNode(target);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [readOnly]);

  // Insert link
  const insertLink = useCallback(() => {
    if (readOnly) return;
    
    const url = prompt('Nhập URL:');
    if (url) {
      formatText('createLink', url);
    }
  }, [formatText, readOnly]);

  // Insert image
  const insertImage = useCallback(() => {
    if (readOnly) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            formatText('insertImage', result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [formatText, readOnly]);

  // Add section
  const addSection = useCallback((type: EditorSection['type']) => {
    const newSection: EditorSection = {
      id: Date.now().toString(),
      title: '',
      content: '',
      type
    };
    setSections(prev => [...prev, newSection]);
  }, []);

  // Update section
  const updateSection = useCallback((id: string, field: keyof EditorSection, value: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  }, []);

  // Remove section
  const removeSection = useCallback((id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
  }, []);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // Toolbar component
  const Toolbar = () => (
    <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
      {/* Text formatting */}
      <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Đậm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Nghiêng"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Gạch chân"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
          </svg>
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Danh sách"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Danh sách có số"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
          </svg>
        </button>
      </div>

      {/* Insert */}
      <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
        <button
          type="button"
          onClick={insertLink}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Chèn liên kết"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={insertImage}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Chèn hình ảnh"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        </button>
      </div>

      {/* Sections */}
      <div className="flex items-center gap-1">
        <select
          onChange={(e) => {
            if (e.target.value) {
              addSection(e.target.value as EditorSection['type']);
              e.target.value = '';
            }
          }}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          defaultValue=""
        >
          <option value="">Thêm phần</option>
          <option value="text">Văn bản</option>
          <option value="image">Hình ảnh</option>
          <option value="video">Video</option>
          <option value="table">Bảng</option>
        </select>
      </div>

      {/* Editor/Preview tabs */}
      <div className="ml-auto flex items-center">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-3 py-1 text-sm rounded-l ${
            activeTab === 'editor' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          Soạn thảo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-3 py-1 text-sm rounded-r ${
            activeTab === 'preview' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          Xem trước
        </button>
      </div>
    </div>
  );

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {!readOnly && <Toolbar />}
      
      <style>{`
        [contentEditable] img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
          border: 2px solid transparent;
          border-radius: 4px;
          transition: border-color 0.2s;
        }
        [contentEditable] img:hover {
          border-color: #3b82f6;
        }
        [contentEditable] img:focus,
        [contentEditable] img.selected {
          border-color: #1d4ed8;
          outline: none;
        }
      `}</style>
      
      <div className="relative">
        {activeTab === 'editor' ? (
          <div
            ref={editorRef}
            contentEditable={!readOnly}
            className={`p-4 outline-none ${isFocused ? 'ring-2 ring-blue-500' : ''}`}
            style={{ maxHeight, overflowY: 'auto' }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: content }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        ) : (
          <div
            className="p-4 bg-gray-50 dark:bg-gray-800"
            style={{ maxHeight, overflowY: 'auto' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        
        {!content && activeTab === 'editor' && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Sections */}
      {sections.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-600 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Các phần bổ sung</h3>
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                  placeholder="Tiêu đề phần"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mr-2 bg-white dark:bg-gray-700"
                />
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {section.type}
                </span>
                <button
                  onClick={() => removeSection(section.id)}
                  className="ml-2 p-1 text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
              
              {section.type === 'text' && (
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  placeholder="Nội dung văn bản"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  rows={3}
                />
              )}
              
              {(section.type === 'image' || section.type === 'video') && (
                <input
                  type="url"
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  placeholder={`URL ${section.type === 'image' ? 'hình ảnh' : 'video'}`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
              )}
              
              {section.type === 'table' && (
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  placeholder="Dữ liệu bảng (JSON hoặc CSV)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  rows={4}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
