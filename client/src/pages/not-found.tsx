/**
 * not-found.tsx
 * 
 * The 404 page component for the D&D Companion application.
 * Displayed when users navigate to non-existent routes or encounter routing errors.
 * 
 * Key features:
 * - Clear error messaging
 * - Visual feedback with icon
 * - Simple, clean design
 * - Responsive layout
 * 
 * Works with:
 * - App.tsx for route handling
 * - ui/card for layout structure
 */

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}