/**
 * auth-page.tsx
 * 
 * This page provides the authentication interface for the D&D Companion application.
 * It includes both login and registration forms, with form validation and error handling.
 * 
 * Key features:
 * - Two-column layout with forms and feature description
 * - Tab-based switching between login and registration
 * - Form validation using Zod schemas
 * - Automatic redirection after successful authentication
 * - Responsive design for various screen sizes
 * 
 * Works with:
 * - useAuth hook for authentication state
 * - ProtectedRoute for access control
 * - @shared/schema.ts for validation schemas
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Initialize login form with validation schema
  const loginForm = useForm({
    resolver: zodResolver(
      insertUserSchema.pick({
        username: true,
        password: true,
      })
    ),
  });

  // Initialize registration form with validation schema
  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="grid w-full max-w-[900px] grid-cols-5 gap-6">
        {/* Login/Register Card */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>D&D Companion</CardTitle>
            <CardDescription>
              Please sign in or create an account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              {/* Tab navigation */}
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    {/* Username field */}
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Password field */}
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Registration Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit((data) =>
                      registerMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    {/* Username field */}
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Choose a username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Password field */}
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Choose a password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      Register
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Feature Description Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>D&D Companion</CardTitle>
            <CardDescription>
              Your digital companion for tabletop roleplaying adventures
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert">
            <p>
              Streamline your D&D campaign management with our comprehensive tools:
            </p>
            <ul>
              <li>Create and manage NPCs, locations, and organizations (entities)</li>
              <li>Track relationships and connections between entities you meet during your travels</li>
              <li>Keep detailed campaign journals and easily link to entities you have created</li>
              <li>Organize your world-building elements</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}