import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your journal entry in markdown..."
          className="min-h-[400px] font-mono"
        />
      </TabsContent>
      <TabsContent value="preview">
        <Card className={cn(
          "prose prose-stone dark:prose-invert max-w-none min-h-[400px] p-4",
          "prose-headings:scroll-m-20 prose-headings:font-medievalsharp",
          "prose-p:text-muted-foreground prose-p:leading-7",
          "prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
          "prose-blockquote:border-l-2 prose-blockquote:border-primary",
          "prose-blockquote:pl-6 prose-blockquote:italic",
          "prose-code:bg-muted prose-code:rounded-md prose-code:px-1 prose-code:py-0.5",
          "prose-img:rounded-lg prose-img:shadow-md"
        )}>
          <ReactMarkdown>{value}</ReactMarkdown>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
