import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Entity, EntityType, entityTypes, entityTemplates, insertEntitySchema, relationshipTypes } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

// Autocomplete input component for suggesting values while typing
function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Keep input value in sync with parent component
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter suggestions based on current input
  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      suggestion.toLowerCase() !== inputValue.toLowerCase()
  );

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Delay hiding suggestions to allow clicking them
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder={placeholder}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1">
          <CardContent className="p-0">
            <div className="max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className={cn(
                    "w-full text-left px-3 py-2 hover:bg-accent",
                    "transition-colors"
                  )}
                  onClick={() => {
                    setInputValue(suggestion);
                    onChange(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// EntityPage component - handles creation and editing of entities (NPCs, locations, etc.)
export default function EntityPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/entity/:type/:id/edit");
  const { toast } = useToast();

  // Get entity type from URL params and validate it
  const type = entityTypes.includes(params?.type as EntityType) ? params?.type as EntityType : null;
  const isNew = params?.id === "new";

  // Initialize form with Zod schema validation
  const form = useForm({
    resolver: zodResolver(insertEntitySchema),
    defaultValues: {
      name: "",
      type: type || "npc",
      description: "",
      properties: type ? entityTemplates[type] : entityTemplates.npc,
      tags: [],
    },
  });

  // Fetch existing NPCs to get race suggestions for autocomplete
  const { data: npcs } = useQuery<Entity[]>({
    queryKey: ["/api/entities", "npc"],
    queryFn: async () => {
      const res = await fetch("/api/entities?type=npc");
      if (!res.ok) throw new Error("Failed to fetch NPCs");
      return res.json();
    },
    enabled: type === "npc", // Only fetch when viewing NPC form
  });

  // Get unique races from existing NPCs for suggestions
  const raceOptions = [...new Set(npcs?.map(npc => npc.properties.race).filter(Boolean) || [])];

  // Fetch entity data when editing existing entity
  const { data: entity, isLoading } = useQuery<Entity>({
    queryKey: [`/api/entities/${params?.id}`],
    enabled: !isNew && !!params?.id,
  });

  // Fetch locations for organization headquarters selection
  const { data: locations } = useQuery<Entity[]>({
    queryKey: ["/api/entities", "location"],
    enabled: type === "organization",
  });

  // Fetch organizations for location and NPC relationship fields
  const { data: organizations } = useQuery<Entity[]>({
    queryKey: ["/api/entities", "organization"],
    enabled: type === "location" || type === "npc",
  });

  // Update form when entity data is loaded
  useEffect(() => {
    if (entity) {
      form.reset(entity);
    } else if (type) {
      form.reset({
        name: "",
        type: type,
        description: "",
        properties: entityTemplates[type],
        tags: [],
      });
    }
  }, [entity, form, type]);

  // Mutation for creating new entities
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/entities", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
      toast({
        title: "Success",
        description: "Entity created successfully",
      });
      setLocation(`/category/${type}`);
    },
  });

  // Mutation for updating existing entities
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

  // Show error if invalid entity type
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

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="container p-6 mx-auto">
      {/* Back button */}
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

      {/* Entity form */}
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

              {/* Dynamic fields based on entity type */}
              {Object.entries(entityTemplates[type]).map(([key]) => {
                // Special handling for NPC race field with autocomplete
                if (key === "race" && type === "npc") {
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`properties.${key}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Race</FormLabel>
                          <FormControl>
                            <AutocompleteInput
                              value={field.value}
                              onChange={field.onChange}
                              suggestions={raceOptions}
                              placeholder="Enter race"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  );
                }

                // Special handling for NPC relationship type
                if (key === "relationship" && type === "npc") {
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`properties.${key}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship type" />
                              </SelectTrigger>
                              <SelectContent>
                                {relationshipTypes.map((relType) => (
                                  <SelectItem
                                    key={relType}
                                    value={relType}
                                  >
                                    {capitalize(relType)}
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

                // Special handling for NPC organization membership
                if (key === "organization" && type === "npc") {
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`properties.${key}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Membership</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || "0"}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select organization" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                {organizations?.map((org) => (
                                  <SelectItem
                                    key={org.id}
                                    value={org.id.toString()}
                                  >
                                    {org.name || "Untitled"}
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

                // Special handling for organization headquarters
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
                              value={field.value || "0"}
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

                // Special handling for location's active organizations
                if (key === "activeOrganizations" && type === "location") {
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`properties.${key}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active Organizations</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                const currentValues = field.value || [];
                                if (!currentValues.includes(value)) {
                                  field.onChange([...currentValues, value]);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Add an organization" />
                              </SelectTrigger>
                              <SelectContent>
                                {organizations?.map((org) => (
                                  <SelectItem
                                    key={org.id}
                                    value={org.id.toString()}
                                  >
                                    {org.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {/* Display selected organizations with remove button */}
                            {field.value && field.value.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {field.value.map((orgId: string) => {
                                  const org = organizations?.find(o => o.id.toString() === orgId);
                                  return org && (
                                    <div key={orgId} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
                                      <span>{org.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          field.onChange(field.value.filter((id: string) => id !== orgId));
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  );
                }

                // Default field rendering for other properties
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