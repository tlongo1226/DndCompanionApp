import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import JournalEntry from "@/pages/JournalEntry";
import CategoryView from "@/pages/CategoryView";
import EntityPage from "@/pages/EntityPage";
import EntityView from "@/pages/EntityView";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/journal/:id" component={JournalEntry} />
      <ProtectedRoute path="/category/:type" component={CategoryView} />
      <ProtectedRoute path="/entity/:type/:id" component={EntityView} />
      <ProtectedRoute path="/entity/:type/:id/edit" component={EntityPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;