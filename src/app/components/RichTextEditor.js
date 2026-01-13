"use client";

import { useEffect, useRef, useState } from 'react';

export default function RichTextEditor({ value, onChange, placeholder = "Enter content...", minHeight = '300px' }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Quill is already loaded
    if (window.Quill) {
      initializeEditor();
      return;
    }

    // Load Quill CSS
    if (!document.querySelector('link[href*="quill.snow.css"]')) {
      const link = document.createElement('link');
      link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Load Quill JS
    if (!document.querySelector('script[src*="quill.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.quilljs.com/1.3.6/quill.js';
      script.async = true;
      script.onload = () => {
        if (window.Quill) {
          initializeEditor();
        }
      };
      document.body.appendChild(script);
    } else {
      // Script already exists, wait a bit and try
      setTimeout(() => {
        if (window.Quill) {
          initializeEditor();
        }
      }, 100);
    }
  }, []);

  const initializeEditor = () => {
    if (!editorRef.current || quillRef.current) return;

    try {
      const quill = new window.Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: minHeight === '150px' ? [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link']
          ] : [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image']
          ]
        },
        placeholder: placeholder,
      });

      // Set initial content
      if (value) {
        quill.root.innerHTML = value;
      }

      // Handle content changes
      quill.on('text-change', () => {
        const content = quill.root.innerHTML;
        if (onChange) {
          onChange(content);
        }
      });

      quillRef.current = quill;
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing Quill:', error);
      setIsLoading(false);
    }
  };

  // Update content when value changes externally
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML;
      if (value !== currentContent) {
        quillRef.current.root.innerHTML = value || '';
      }
    }
  }, [value]);

  return (
    <div className="rich-text-editor">
      {isLoading && (
        <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500">
          Loading editor...
        </div>
      )}
      <div ref={editorRef} className="bg-white" style={{ minHeight: minHeight, display: isLoading ? 'none' : 'block' }} />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-size: 14px;
          min-height: ${minHeight};
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
        }
        .rich-text-editor .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
