import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Journal, insertJournalSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Editor } from "@/components/Editor";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

function extractTitle(markdown: string): string {
  // Match any level header at the start of the content
  const match = markdown.match(/^(#{1,6})\s+(.+)$/m);
  return match ? match[2].trim() : "Untitled Entry";
}

export default function JournalEntry() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/journal/:id");
  const { toast } = useToast();
  const isNew = params?.id === "new";

  const form = useForm({
    resolver: zodResolver(insertJournalSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
    },
  });

  const { data: journal, isLoading } = useQuery<Journal>({
    queryKey: [`/api/journals/${params?.id}`],
    enabled: !isNew && !!params?.id,
  });

  useEffect(() => {
    if (journal) {
      form.reset({
        content: journal.content,
        title: journal.title,
        tags: journal.tags,
      });
    }
  }, [journal, form]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const journalData = {
        ...data,
        title: extractTitle(data.content),
      };
      const res = await apiRequest("POST", "/api/journals", journalData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      queryClient.setQueryData([`/api/journals/${data.id}`], data);
      toast({
        title: "Success",
        description: "Journal entry created successfully",
      });
      setLocation("/");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const journalData = {
        ...data,
        title: extractTitle(data.content),
      };
      const res = await apiRequest("PATCH", `/api/journals/${params?.id}`, journalData);
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate both the list and the individual entry
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      queryClient.setQueryData([`/api/journals/${params?.id}`], data);
      toast({
        title: "Success",
        description: "Journal entry updated successfully",
      });
      setLocation("/");
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (isNew) {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="container p-6 mx-auto space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isNew && (
                <div className="flex justify-end mb-4">
                  <Button 
                    type="submit" 
                    className="gap-2"
                    disabled={updateMutation.isPending}
                  >
                    <Edit2 className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Card className={cn(
                        "prose prose-stone dark:prose-invert max-w-none min-h-[400px] p-4",
                        "prose-headings:scroll-m-20 prose-headings:text-foreground",
                        "prose-p:text-foreground prose-p:leading-7",
                        "prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
                        "prose-blockquote:border-l-2 prose-blockquote:border-primary",
                        "prose-blockquote:pl-6 prose-blockquote:italic",
                        "prose-code:bg-muted prose-code:rounded-md prose-code:px-1 prose-code:py-0.5",
                        "prose-img:rounded-lg prose-img:shadow-md"
                      )}>
                        <Editor 
                          value={field.value} 
                          onChange={field.onChange} 
                          defaultTab={isNew ? "write" : "preview"} 
                        />
                      </Card>
                    </FormControl>
                  </FormItem>
                )}
              />

              {isNew && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/")}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    Create Entry
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}