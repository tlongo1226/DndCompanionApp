import { useState } from "react";
import { useRoute } from "wouter";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Entity, EntityType, relationshipTypes } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { capitalize } from "@/lib/utils";

const categoryIcons = {
  npc: "👤",
  creature: "🐉",
  location: "🏰",
  organization: "⚔️",
};

export default function CategoryView() {
  const [, params] = useRoute("/category/:type");
  const [, setLocation] = useLocation();
  const type = params?.type as EntityType;

  // Filter states for NPCs
  const [filters, setFilters] = useState({
    race: "",
    class: "",
    alignment: "",
    relationship: "",
    organization: "",
  });

  const { data: entities, isLoading } = useQuery<Entity[]>({
    queryKey: ["/api/entities", type],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/entities?type=${queryKey[1]}`);
      if (!res.ok) throw new Error("Failed to fetch entities");
      return res.json();
    },
  });

  // Fetch organizations for NPC filtering
  const { data: organizations } = useQuery<Entity[]>({
    queryKey: ["/api/entities", "organization"],
    queryFn: async () => {
      const res = await fetch("/api/entities?type=organization");
      if (!res.ok) throw new Error("Failed to fetch organizations");
      return res.json();
    },
    enabled: type === "npc",
  });

  // Filter entities based on selected filters
  const filteredEntities = entities?.filter(entity => {
    if (type !== "npc") return true;

    const properties = entity.properties;
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === "organization") {
        return properties[key] === value;
      }
      return properties[key]?.toLowerCase().includes(value.toLowerCase());
    });
  });

  if (isLoading) {
    return (
      <div className="container p-6 mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold capitalize flex items-center gap-2">
          <span>{categoryIcons[type]}</span>
          {type}s
        </h1>
        <Link href={`/entity/${type}/new/edit`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New {type}
          </Button>
        </Link>
      </div>

      {/* Filter controls for NPCs */}
      {type === "npc" && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Race</Label>
                <Input
                  placeholder="Filter by race"
                  value={filters.race}
                  onChange={(e) => setFilters(prev => ({ ...prev, race: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Input
                  placeholder="Filter by class"
                  value={filters.class}
                  onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Alignment</Label>
                <Input
                  placeholder="Filter by alignment"
                  value={filters.alignment}
                  onChange={(e) => setFilters(prev => ({ ...prev, alignment: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                <Select
                  value={filters.relationship}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, relationship: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {relationshipTypes.map((relType) => (
                      <SelectItem key={relType} value={relType}>
                        {capitalize(relType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={filters.organization}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, organization: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {organizations?.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name || "Untitled"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities?.map((entity) => (
          <Link key={entity.id} href={`/entity/${type}/${entity.id}`}>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle>{entity.name || "Untitled"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {entity.description || "No description"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {(filteredEntities?.length ?? 0) === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No {type}s found. Create your first one!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}