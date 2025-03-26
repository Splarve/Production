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
      const isInitializedRef = useRef(false);
      const contentRef = useRef(value);
      
      // Initialize Quill once when component mounts
      useEffect(() => {
        if (!editorRef.current) return;
        
        // Only initialize once
        if (!quillInstance.current) {
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
          
          // Set initial content if present
          if (value && value.trim() !== '') {
            const sanitizedValue = DOMPurify.sanitize(value);
            quill.root.innerHTML = sanitizedValue;
            contentRef.current = sanitizedValue;
          }
          
          // Handle text changes - debounce slightly for better performance
          quill.on('text-change', () => {
            const html = quill.root.innerHTML;
            const sanitizedHtml = DOMPurify.sanitize(html);
            
            // Store in our ref
            contentRef.current = sanitizedHtml;
            
            // Check if content is just an empty paragraph
            const isEmpty = sanitizedHtml === '<p><br></p>' || sanitizedHtml.trim() === '';
            
            // Call onChange with empty string if it's empty, otherwise pass the content
            onChange(isEmpty ? '' : sanitizedHtml);
          });
          
          quillInstance.current = quill;
          isInitializedRef.current = true;
        }
      }, []);
      
      // Handle value changes from parent component
      useEffect(() => {
        if (!quillInstance.current || !isInitializedRef.current) return;
        
        // Don't update if the content is already what we expect
        if (value !== contentRef.current) {
          const quill = quillInstance.current;
          
          // Save selection
          const range = quill.getSelection();
          
          // Update content
          const sanitizedValue = value ? DOMPurify.sanitize(value) : '';
          quill.root.innerHTML = sanitizedValue;
          contentRef.current = sanitizedValue;
          
          // Restore selection
          if (range) {
            setTimeout(() => quill.setSelection(range), 0);
          }
        }
      }, [value]);
      
      // Return component immediately without hidden display
      return <div ref={editorRef} className="h-64"></div>;
    };
  },
  {
    ssr: false,
    loading: () => <LoadingEditor />
  }
);

export default QuillEditor;