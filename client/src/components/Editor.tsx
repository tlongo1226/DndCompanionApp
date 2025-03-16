import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Entity } from "@shared/schema";
import { Link } from "wouter";

// Interface for tracking @ mention position and search text
interface MentionMatch {
  index: number;  // Position in the text where the @ mention starts
  text: string;   // The text being typed after the @ symbol
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  // State for tracking active @ mention
  const [mentionSearch, setMentionSearch] = useState<MentionMatch | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all entities for @ mention suggestions
  const { data: entities } = useQuery<Entity[]>({
    queryKey: ["/api/entities"],
  });

  // Monitor text input for @ mentions
  useEffect(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    // Match @ followed by any word characters
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionSearch({
        index: mentionMatch.index!,
        text: mentionMatch[1],
      });
    } else {
      setMentionSearch(null);
    }
  }, [value]);

  // Filter entities based on what user has typed after @
  const matchingEntities = mentionSearch && entities 
    ? entities.filter(e => 
        e.name.toLowerCase().includes(mentionSearch.text.toLowerCase())
      )
    : [];

  // Handle selecting an entity from the suggestion list
  const handleMentionSelect = (entity: Entity) => {
    if (!mentionSearch || !textareaRef.current) return;

    // Replace the @mention text with a markdown link to the entity
    const newValue = 
      value.slice(0, mentionSearch.index) + 
      `@[${entity.name}](entity/${entity.type}/${entity.id})` +
      value.slice(mentionSearch.index + mentionSearch.text.length + 1);

    onChange(newValue);
    setMentionSearch(null);
  };

  // Custom component to render entity links in the preview
  const MarkdownLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    if (href.startsWith('entity/')) {
      // Internal entity links
      return <Link href={`/${href}`} className="text-primary hover:underline">{children}</Link>;
    }
    // External links
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  };

  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write" className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your journal entry in markdown..."
          className="min-h-[400px] font-mono"
        />
        {/* Show entity suggestions when @ is typed */}
        {mentionSearch && matchingEntities.length > 0 && (
          <Card className="absolute z-10 mt-1 w-64 max-h-48 overflow-y-auto">
            <div className="p-2 space-y-1">
              {matchingEntities.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => handleMentionSelect(entity)}
                  className="w-full text-left px-2 py-1 hover:bg-accent rounded-sm"
                >
                  {entity.name} ({entity.type})
                </button>
              ))}
            </div>
          </Card>
        )}
      </TabsContent>
      <TabsContent value="preview">
        <Card className={cn(
          "prose prose-stone dark:prose-invert max-w-none min-h-[400px] p-4",
          "prose-headings:scroll-m-20",
          "prose-p:text-muted-foreground prose-p:leading-7",
          "prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
          "prose-blockquote:border-l-2 prose-blockquote:border-primary",
          "prose-blockquote:pl-6 prose-blockquote:italic",
          "prose-code:bg-muted prose-code:rounded-md prose-code:px-1 prose-code:py-0.5",
          "prose-img:rounded-lg prose-img:shadow-md"
        )}>
          <ReactMarkdown
            components={{
              a: MarkdownLink as any
            }}
          >
            {value}
          </ReactMarkdown>
        </Card>
      </TabsContent>
    </Tabs>
  );
}