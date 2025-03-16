import { useRoute } from "wouter";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Entity, EntityType } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data: entities, isLoading } = useQuery<Entity[]>({
    queryKey: ["/api/entities", type],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/entities?type=${queryKey[1]}`);
      if (!res.ok) throw new Error("Failed to fetch entities");
      return res.json();
    },
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities?.map((entity) => (
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

        {entities?.length === 0 && (
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