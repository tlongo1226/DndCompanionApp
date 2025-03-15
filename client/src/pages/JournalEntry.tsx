import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Journal, insertJournalSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Editor } from "@/components/Editor";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

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
      form.reset(journal);
    }
  }, [journal, form]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const journalData = {
        ...data,
        title: extractTitle(data.content),
      };
      const res = await apiRequest("POST", "/api/journals", journalData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      toast({
        title: "Success",
        description: "Journal entry created successfully",
      });
      setLocation("/");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const journalData = {
        ...data,
        title: extractTitle(data.content),
      };
      const res = await apiRequest("PATCH", `/api/journals/${params?.id}`, journalData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      toast({
        title: "Success",
        description: "Journal entry updated successfully",
      });
      setLocation("/");
    },
  });

  const onSubmit = (data: typeof form.getValues) => {
    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
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
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Editor value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isNew ? "Create" : "Update"} Entry
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}