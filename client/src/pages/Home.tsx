/**
 * Home.tsx
 * 
 * The main dashboard component for the D&D Companion application.
 * Displays an overview of the user's campaign elements and recent activity.
 * 
 * Key features:
 * - Quick stats for different entity types (NPCs, Creatures, etc.)
 * - Recent journal entries display
 * - Navigation to entity categories
 * - Background styling with overlay for readability
 * 
 * Works with:
 * - Layout.tsx for page structure
 * - CategoryView.tsx for detailed entity lists
 * - @shared/schema.ts for type definitions
 */

import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Journal, Entity } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, ScrollText, Users, Building, Map, Sword } from "lucide-react";

export default function Home() {
  // Fetch recent journal entries
  const { data: journals, isLoading: loadingJournals } = useQuery<Journal[]>({ 
    queryKey: ["/api/journals"] 
  });

  // Fetch all entities for stats display
  const { data: entities, isLoading: loadingEntities } = useQuery<Entity[]>({ 
    queryKey: ["/api/entities"] 
  });

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1524373050940-8f19e9b858a9')] bg-cover bg-fixed">
      {/* Semi-transparent overlay for better text readability */}
      <div className="min-h-screen bg-background/95">
        <div className="container p-6 mx-auto grid gap-6">
          {/* Page title with gradient text effect */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
            D&D Campaign Journal
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Entity type quick stats grid */}
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              {/* NPCs stat card */}
              <Link href="/category/npc">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">NPCs</h3>
                    <p className="text-sm text-muted-foreground">
                      {entities?.filter((e) => e.type === "npc").length || 0} entries
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Creatures stat card */}
              <Link href="/category/creature">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-4 text-center">
                    <Sword className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Creatures</h3>
                    <p className="text-sm text-muted-foreground">
                      {entities?.filter((e) => e.type === "creature").length || 0} entries
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Locations stat card */}
              <Link href="/category/location">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-4 text-center">
                    <Map className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Locations</h3>
                    <p className="text-sm text-muted-foreground">
                      {entities?.filter((e) => e.type === "location").length || 0} entries
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Organizations stat card */}
              <Link href="/category/organization">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-4 text-center">
                    <Building className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Organizations</h3>
                    <p className="text-sm text-muted-foreground">
                      {entities?.filter((e) => e.type === "organization").length || 0} entries
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent journal entries section */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5" />
                  Recent Journal Entries
                </CardTitle>
                <Link href="/journal/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Entry
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {/* Scrollable area for journal entries */}
                <ScrollArea className="h-[300px]">
                  {/* Loading state */}
                  {loadingJournals ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : journals?.length === 0 ? (
                    // Empty state
                    <p className="text-muted-foreground text-center py-8">
                      No journal entries yet. Create your first one!
                    </p>
                  ) : (
                    // Journal entries list
                    <div className="space-y-2">
                      {journals?.map((journal) => (
                        <Link key={journal.id} href={`/journal/${journal.id}`}>
                          <Card className="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent className="p-4">
                              <h3 className="font-semibold">{journal.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(journal.created).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}