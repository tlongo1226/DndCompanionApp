import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Entity, insertEntitySchema, entityTemplates, EntityType, entityTypes } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// EntityPage handles both creation and editing of entities (NPCs, Creatures, Locations, Organizations)
export default function EntityPage() {
  // Navigation and routing hooks
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/entity/:type/:id/edit");
  const { toast } = useToast();

  // Check if we're creating a new entity or editing an existing one
  const isNew = params?.id === "new";
  // Validate that the type from URL is a valid EntityType
  const type = entityTypes.includes(params?.type as EntityType) ? params?.type as EntityType : null;

  // Initialize the form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(insertEntitySchema),
    defaultValues: {
      name: "",
      type: type || "npc", // Set the type from the URL parameter, default to "npc" if invalid
      description: "",
      // Get property template based on entity type
      properties: type ? entityTemplates[type] : entityTemplates.npc,
      tags: [],
    },
  });

  // Fetch entity data if we're editing an existing entity
  const { data: entity, isLoading } = useQuery<Entity>({
    queryKey: [`/api/entities/${params?.id}`],
    enabled: !isNew && !!params?.id,
  });

  // Fetch locations for organization form
  const { data: locations } = useQuery<Entity[]>({
    queryKey: ["/api/entities", "location"],
    queryFn: async () => {
      const res = await fetch("/api/entities?type=location");
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
    enabled: type === "organization", // Only fetch locations for organization form
  });


  useEffect(() => {
    if (entity) {
      form.reset(entity);
    } else if (type === "organization") {
      // Set default values for new organization
      form.reset({
        name: "",
        type: type,
        description: "",
        properties: entityTemplates[type],
        tags: [],
      });
    }
  }, [entity, form, type]);

  // Mutation for creating a new entity
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/entities", data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the entities cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
      toast({
        title: "Success",
        description: "Entity created successfully",
      });
      setLocation(`/category/${type}`);
    },
  });

  // Mutation for updating an existing entity
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/entities/${params?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
      toast({
        title: "Success",
        description: "Entity updated successfully",
      });
      setLocation(`/category/${type}`);
    },
  });

  // Handle form submission
  const onSubmit = (data: any) => {
    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  // Show loading state while fetching entity data
  if (!isNew && isLoading) {
    return (
      <div className="container p-6 mx-auto space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // If type is not valid, show error message
  if (!type) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center gap-2 text-destructive">
          <p>Invalid entity type. Please return to home and try again.</p>
          <Button variant="outline" onClick={() => setLocation("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/category/${type}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {type}s
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={`Enter ${type} name`} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Description field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={`Enter ${type} description`}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Dynamic property fields based on entity type */}
              {Object.entries(entityTemplates[type]).map(([key]) => {
                // Special handling for headquarters field
                if (key === "headquarters" && type === "organization") {
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`properties.${key}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Headquarters</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || "0"} // Use "0" as default/none value
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                {locations?.map((location) => (
                                  <SelectItem 
                                    key={location.id} 
                                    value={location.id.toString()}
                                  >
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  );
                }

                // Regular property fields
                return (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`properties.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{key}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={`Enter ${key}`} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                );
              })}

              {/* Form actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/category/${type}`)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isNew ? "Create" : "Update"} {type}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}