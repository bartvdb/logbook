import { useCallback, useMemo, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';

// Plugins
import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import Blockquote from '@yoopta/blockquote';
import Code from '@yoopta/code';
import Image from '@yoopta/image';
import Video from '@yoopta/video';
import Embed from '@yoopta/embed';
import File from '@yoopta/file';
import Divider from '@yoopta/divider';
import Table from '@yoopta/table';
import Callout from '@yoopta/callout';
import Link from '@yoopta/link';

// Tools
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';

// Marks
import {
  Bold,
  Italic,
  Underline,
  Strike,
  CodeMark,
  Highlight,
} from '@yoopta/marks';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface YooptaEditorProps {
  value: YooptaContentValue;
  onChange: (value: YooptaContentValue) => void;
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export interface YooptaEditorRef {
  getContent: () => YooptaContentValue;
}

// Upload function for images and files
const uploadToSupabase = async (file: File): Promise<string> => {
  if (!supabase || !isSupabaseConfigured()) {
    // Fallback to data URL for local storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage
    .from('logbook-files')
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error);
    // Fallback to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const { data: urlData } = supabase.storage
    .from('logbook-files')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

// Create plugins array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createPlugins = (): any[] => [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  BulletedList,
  NumberedList,
  TodoList,
  Blockquote,
  Code,
  Image.extend({
    options: {
      async onUpload(file: File) {
        const url = await uploadToSupabase(file);
        return {
          src: url,
          alt: file.name,
          sizes: {
            width: 0,
            height: 0,
          },
        };
      },
    },
  }),
  Video.extend({
    options: {
      async onUpload(file: File) {
        const url = await uploadToSupabase(file);
        return {
          src: url,
          sizes: {
            width: 0,
            height: 0,
          },
        };
      },
    },
  }),
  Embed,
  File.extend({
    options: {
      async onUpload(file: File) {
        const url = await uploadToSupabase(file);
        return {
          src: url,
          name: file.name,
          size: file.size,
          format: file.type,
        };
      },
    },
  }),
  Divider,
  Table,
  Callout,
  Link,
];

// Create marks array
const MARKS = [Bold, Italic, Underline, Strike, CodeMark, Highlight];

// Create tools configuration
const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

export const LogbookEditor = forwardRef<YooptaEditorRef, YooptaEditorProps>(({
  value,
  onChange,
  readOnly = false,
  placeholder = 'Start writing...',
  autoFocus = false,
  className = '',
}, ref) => {
  const editor = useMemo(() => createYooptaEditor(), []);
  const selectionRef = useRef<HTMLDivElement>(null);

  const plugins = useMemo(() => createPlugins(), []);

  // Expose getContent method via ref
  useImperativeHandle(ref, () => ({
    getContent: () => editor.children,
  }), [editor]);

  // Handle paste for images
  useEffect(() => {
    if (readOnly) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            try {
              const url = await uploadToSupabase(file);
              // Insert image using editor's insertBlock method
              editor.insertBlock('Image', {
                focus: true,
              });
              // Update the newly inserted block with image data
              const blocks = editor.children;
              const blockIds = Object.keys(blocks);
              const lastBlockId = blockIds[blockIds.length - 1];
              if (lastBlockId) {
                editor.updateBlock(lastBlockId, {
                  value: [
                    {
                      id: `img-${Date.now()}`,
                      type: 'image',
                      children: [{ text: '' }],
                      props: {
                        src: url,
                        alt: file.name,
                        nodeType: 'block',
                        sizes: {
                          width: 0,
                          height: 0,
                        },
                      },
                    },
                  ],
                });
              }
            } catch (error) {
              console.error('Failed to upload pasted image:', error);
            }
          }
          break;
        }
      }
    };

    const container = selectionRef.current;
    container?.addEventListener('paste', handlePaste);

    return () => {
      container?.removeEventListener('paste', handlePaste);
    };
  }, [editor, readOnly]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && !readOnly) {
      editor.focus();
    }
  }, [editor, autoFocus, readOnly]);

  const handleChange = useCallback(
    (newValue: YooptaContentValue) => {
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div
      ref={selectionRef}
      className={`yoopta-editor-container ${className}`}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        marks={MARKS}
        tools={readOnly ? {} : TOOLS}
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder={placeholder}
        selectionBoxRoot={selectionRef}
        autoFocus={autoFocus}
        width="100%"
        style={{ width: '100%', maxWidth: '100%' }}
      />
    </div>
  );
});

LogbookEditor.displayName = 'LogbookEditor';

// Helper to create empty document
export const createEmptyDocument = (): YooptaContentValue => ({
  'block-1': {
    id: 'block-1',
    type: 'Paragraph',
    value: [
      {
        id: 'element-1',
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
    meta: {
      order: 0,
      depth: 0,
    },
  },
});

// Helper to convert plain text to Yoopta format
export const textToYooptaContent = (text: string): YooptaContentValue => {
  if (!text || text.trim() === '') {
    return createEmptyDocument();
  }

  const paragraphs = text.split('\n\n').filter(Boolean);
  const content: YooptaContentValue = {};

  paragraphs.forEach((paragraph, index) => {
    const blockId = `block-${index + 1}`;
    content[blockId] = {
      id: blockId,
      type: 'Paragraph',
      value: [
        {
          id: `element-${index + 1}`,
          type: 'paragraph',
          children: [{ text: paragraph }],
        },
      ],
      meta: {
        order: index,
        depth: 0,
      },
    };
  });

  return Object.keys(content).length > 0 ? content : createEmptyDocument();
};

// Helper to extract plain text from Yoopta content
export const yooptaContentToText = (content: YooptaContentValue): string => {
  if (!content || Object.keys(content).length === 0) {
    return '';
  }

  const blocks = Object.values(content)
    .sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0));

  return blocks
    .map((block) => {
      if (!block.value || !Array.isArray(block.value)) return '';
      return block.value
        .map((element) => {
          // Type assertion for element with children
          const el = element as { children?: Array<{ text?: string }> };
          if (!el.children) return '';
          return el.children
            .map((child) => child.text || '')
            .join('');
        })
        .join('\n');
    })
    .join('\n\n');
};

// Check if content is valid Yoopta JSON
export const isYooptaContent = (content: unknown): content is YooptaContentValue => {
  if (!content || typeof content !== 'object') return false;
  const obj = content as Record<string, unknown>;
  const firstValue = Object.values(obj)[0];
  if (!firstValue || typeof firstValue !== 'object') return false;
  const block = firstValue as Record<string, unknown>;
  return 'id' in block && 'type' in block && 'value' in block;
};

export default LogbookEditor;
