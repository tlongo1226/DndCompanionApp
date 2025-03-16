import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import JournalEntry from "@/pages/JournalEntry";
import CategoryView from "@/pages/CategoryView";
import EntityPage from "@/pages/EntityPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/journal/:id" component={JournalEntry} />
      <Route path="/category/:type" component={CategoryView} />
      <Route path="/entity/:type/:id" component={EntityPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;