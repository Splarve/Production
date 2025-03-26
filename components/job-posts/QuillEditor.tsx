// components/job-posts/QuillEditor.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';

// Simple loading component
const LoadingEditor = () => (
  <div className="h-64 border rounded-md flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Using dynamic import to avoid SSR issues
const QuillEditor = dynamic(
  async () => {
    const { default: Quill } = await import('quill');
    const { default: DOMPurify } = await import('dompurify');
    
    return function QuillComponent({ value, onChange, placeholder }: QuillEditorProps) {
      const editorRef = useRef<HTMLDivElement>(null);
      const quillInstance = useRef<any>(null);
      
      // Initialize Quill once when component mounts
      useEffect(() => {
        if (!editorRef.current || quillInstance.current) return;
        
        const quill = new Quill(editorRef.current, {
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link', 'clean']
            ]
          },
          placeholder: placeholder || 'Write a detailed job description...',
          theme: 'snow'
        });
        
        // Set initial content
        if (value) {
          const sanitizedValue = DOMPurify.sanitize(value);
          quill.root.innerHTML = sanitizedValue;
        }
        
        // Handle text changes
        quill.on('text-change', () => {
          const html = quill.root.innerHTML;
          const sanitizedHtml = DOMPurify.sanitize(html);
          onChange(sanitizedHtml);
        });
        
        quillInstance.current = quill;
        
        // Cleanup on unmount
        return () => {
          if (quillInstance.current) {
            quillInstance.current.off('text-change');
          }
        };
      }, []);
      
      // Handle value changes from parent component
      useEffect(() => {
        if (!quillInstance.current) return;
        
        const quill = quillInstance.current;
        if (quill.root.innerHTML !== value) {
          const sanitizedValue = DOMPurify.sanitize(value);
          quill.root.innerHTML = sanitizedValue;
        }
      }, [value]);
      
      return <div ref={editorRef} className="h-64"></div>;
    };
  },
  {
    ssr: false,
    loading: () => <LoadingEditor />
  }
);

export default QuillEditor;