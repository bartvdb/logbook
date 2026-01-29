import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, X, Loader2 } from 'lucide-react';
import { usePreferences } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { KnowledgeFile } from '@/types';

// Maximum character limit for custom instructions
const MAX_CHARACTERS = 10000;

interface CustomInstructionsProps {
  onSaved?: () => void;
}

export const CustomInstructions: React.FC<CustomInstructionsProps> = ({ onSaved }) => {
  const { preferences, update, isLoading } = usePreferences();
  const [instructions, setInstructions] = useState('');
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (preferences?.customInstructions) {
      setInstructions(preferences.customInstructions);
    }
    if (preferences?.knowledgeFiles) {
      setKnowledgeFiles(preferences.knowledgeFiles);
    }
  }, [preferences?.customInstructions, preferences?.knowledgeFiles]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await update({ customInstructions: instructions, knowledgeFiles });
      onSaved?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are supported');
        continue;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        continue;
      }

      try {
        const text = await extractTextFromPDF(file);
        const newFile: KnowledgeFile = {
          id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          content: text,
          createdAt: new Date(),
        };
        setKnowledgeFiles(prev => [...prev, newFile]);
      } catch (error) {
        console.error('Failed to process PDF:', error);
        setUploadError('Failed to extract text from PDF. Please try a different file.');
      }
    }

    setIsUploading(false);
    // Reset input
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setKnowledgeFiles(prev => prev.filter(f => f.id !== id));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  const totalKnowledgeChars = knowledgeFiles.reduce((sum, f) => sum + f.content.length, 0);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Custom Instructions</Label>
        <p className="text-sm text-muted-foreground">
          Add any specific instructions or context for your AI mentor. This could include:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Specific challenges you're facing</li>
          <li>Topics you want to focus on or avoid</li>
          <li>Communication style preferences</li>
          <li>Context about your current situation</li>
        </ul>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., I'm currently transitioning from engineering to management. Please help me develop leadership skills while staying technical. Avoid generic advice - I prefer actionable insights based on first principles thinking."
          rows={8}
          className="resize-none"
        />
        <p className={`text-xs ${instructions.length > MAX_CHARACTERS ? 'text-destructive' : 'text-muted-foreground'}`}>
          {instructions.length.toLocaleString()}/{MAX_CHARACTERS.toLocaleString()} characters
        </p>
      </div>

      {/* Knowledge Files Section */}
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Knowledge Files</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Upload PDF documents to give your AI mentor additional context and knowledge.
            </p>
          </div>
        </div>

        {/* Uploaded files list */}
        {knowledgeFiles.length > 0 && (
          <div className="space-y-2">
            {knowledgeFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.content.length.toLocaleString()} characters extracted
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Total knowledge: {totalKnowledgeChars.toLocaleString()} characters from {knowledgeFiles.length} file(s)
            </p>
          </div>
        )}

        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload PDF
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Max 5MB per file. Text will be extracted from the PDF.
          </p>
          {uploadError && (
            <p className="text-xs text-destructive mt-1">{uploadError}</p>
          )}
        </div>
      </div>

      <Separator />

      <Button
        onClick={handleSave}
        disabled={isSaving || instructions.length > MAX_CHARACTERS}
        className="w-full"
      >
        {isSaving ? 'Saving...' : 'Save Instructions'}
      </Button>

      {/* Examples */}
      <Separator />
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Examples</h4>
        <div className="space-y-3">
          <ExampleInstruction
            title="For a Product Manager"
            text="I'm a PM at a Series B startup. Help me balance strategic thinking with execution. When reviewing my entries, look for opportunities to improve stakeholder communication and data-driven decision making."
            onUse={setInstructions}
          />
          <ExampleInstruction
            title="For a Founder"
            text="I'm building a company and often feel overwhelmed. Please be direct with feedback and help me prioritize ruthlessly. Use first principles thinking when suggesting solutions."
            onUse={setInstructions}
          />
          <ExampleInstruction
            title="For Personal Growth"
            text="I want to develop better emotional intelligence and self-awareness. Ask me questions that help me understand my patterns and reactions. Be gentle but insightful."
            onUse={setInstructions}
          />
        </div>
      </div>
    </div>
  );
};

interface ExampleInstructionProps {
  title: string;
  text: string;
  onUse: (text: string) => void;
}

const ExampleInstruction: React.FC<ExampleInstructionProps> = ({
  title,
  text,
  onUse,
}) => (
  <div className="p-3 bg-muted/50 rounded-lg">
    <div className="flex items-start justify-between gap-2 mb-1">
      <span className="text-sm font-medium">{title}</span>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs"
        onClick={() => onUse(text)}
      >
        Use this
      </Button>
    </div>
    <p className="text-xs text-muted-foreground">{text}</p>
  </div>
);

// Helper function to extract text from PDF
async function extractTextFromPDF(file: File): Promise<string> {
  // Use pdf.js to extract text
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => {
        // TextItem has str property, TextMarkedContent does not
        if ('str' in item) {
          return (item as { str: string }).str;
        }
        return '';
      })
      .join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}

export default CustomInstructions;
