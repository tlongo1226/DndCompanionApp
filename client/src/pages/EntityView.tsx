// EditableField component allows inline editing of entity fields
interface EditableFieldProps {
  value: string | undefined;
  onSave: (value: string) => void;
  multiline?: boolean;
}

function EditableField({ value, onSave, multiline }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  // Display mode - shows value and edit button on hover
  if (!isEditing) {
    return (
      <div className="group flex items-start gap-2">
        <div className="flex-1 whitespace-pre-wrap">
          {value || <span className="text-muted-foreground">Not set</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Edit mode - shows input/textarea and save/cancel buttons
  return (
    <div className="space-y-2">
      {multiline ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[100px]"
        />
      ) : (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
        />
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Main entity view component
export default function EntityView() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/entity/:type/:id");
  const { toast } = useToast();
  const type = params?.type as EntityType;

  // Fetch entity data
  const { data: entity, isLoading } = useQuery<Entity>({
    queryKey: [`/api/entities/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch headquarters data for organizations
  const { data: headquarters } = useQuery<Entity>({
    queryKey: [`/api/entities/${entity?.properties.headquarters}`],
    enabled: type === "organization" && !!entity?.properties.headquarters && entity?.properties.headquarters !== "0",
  });

  // Fetch active organizations data for locations
  const { data: activeOrganizations } = useQuery<Entity[]>({
    queryKey: ["/api/entities", "organizations-in-location"],
    queryFn: async () => {
      const orgIds = entity?.properties.activeOrganizations || [];
      if (!orgIds.length) return [];

      const orgs = await Promise.all(
        orgIds.map(async (id: string) => {
          const res = await fetch(`/api/entities/${id}`);
          if (!res.ok) return null;
          return res.json();
        })
      );
      return orgs.filter(Boolean);
    },
    enabled: type === "location" && !!entity?.properties.activeOrganizations?.length,
  });

  // Fetch organization data for NPCs
  const { data: organization } = useQuery<Entity>({
    queryKey: [`/api/entities/${entity?.properties.organization}`],
    enabled: type === "npc" && !!entity?.properties.organization && entity?.properties.organization !== "0",
  });

  // Mutation for updating individual fields
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Entity>) => {
      const res = await apiRequest("PATCH", `/api/entities/${params?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
      toast({
        title: "Success",
        description: "Entity updated successfully",
      });
    },
  });

  // Handle field updates
  const handleFieldUpdate = (field: string, value: string) => {
    if (field.startsWith("properties.")) {
      // Update a property field
      const propertyKey = field.split(".")[1];
      updateMutation.mutate({
        properties: {
          ...entity?.properties,
          [propertyKey]: value
        }
      });
    } else {
      // Update a main field (name or description)
      updateMutation.mutate({ [field]: value });
    }
  };

  // Show loading state
  if (isLoading || !entity) {
    return (
      <div className="container p-6 mx-auto space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      {/* Back navigation */}
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
        {/* Entity name with inline editing */}
        <CardHeader>
          <CardTitle>
            <EditableField
              value={entity.name || "Untitled"}
              onSave={(value) => handleFieldUpdate("name", value)}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description with inline editing */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <EditableField
              value={entity.description}
              onSave={(value) => handleFieldUpdate("description", value)}
              multiline
            />
          </div>

          {/* Dynamic properties based on entity type */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Properties</h3>
            <div className="grid gap-4">
              {Object.entries(entityTemplates[type]).map(([key]) => (
                <div key={key}>
                  <label className="text-sm font-medium capitalize">{key}</label>

                  {/* Special handling for organization headquarters */}
                  {key === "headquarters" && type === "organization" ? (
                    headquarters ? (
                      <Link href={`/entity/location/${headquarters.id}`}>
                        <div className="text-primary hover:underline">{headquarters.name}</div>
                      </Link>
                    ) : (
                      <div className="text-muted-foreground">No headquarters set</div>
                    )
                  ) : key === "activeOrganizations" && type === "location" ? (
                    // Special handling for location's active organizations
                    <div className="space-y-2">
                      {activeOrganizations?.length ? (
                        activeOrganizations.map((org) => (
                          <Link key={org.id} href={`/entity/organization/${org.id}`}>
                            <div className="text-primary hover:underline">{org.name}</div>
                          </Link>
                        ))
                      ) : (
                        <div className="text-muted-foreground">No active organizations</div>
                      )}
                    </div>
                  ) : key === "relationship" && type === "npc" ? (
                    // Special handling for NPC relationships
                    <div className="text-foreground">
                      {entity.properties[key] ? capitalize(entity.properties[key]) : (
                        <span className="text-muted-foreground">No relationship set</span>
                      )}
                    </div>
                  ) : key === "organization" && type === "npc" ? (
                    // Special handling for NPC organization membership
                    organization ? (
                      <Link href={`/entity/organization/${organization.id}`}>
                        <div className="text-primary hover:underline">{organization.name || "Untitled"}</div>
                      </Link>
                    ) : (
                      <div className="text-muted-foreground">No organization</div>
                    )
                  ) : (
                    // Default editable field for other properties
                    <EditableField
                      value={entity.properties[key]}
                      onSave={(value) => handleFieldUpdate(`properties.${key}`, value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { Entity, EntityType, entityTemplates } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit2, Check, X } from "lucide-react";
import { capitalize } from "@/lib/utils";