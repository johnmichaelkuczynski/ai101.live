import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import Assignments from "@/pages/Assignments";
import Analytics from "@/pages/Analytics";
import WeekView from "@/pages/WeekView";
import LectureView from "@/pages/LectureView";
import AssignmentRunner from "@/pages/AssignmentRunner";
import Assessments from "@/pages/Assessments";
import AssessmentRunner from "@/pages/AssessmentRunner";
import Diagnostics from "@/pages/Diagnostics";
import TopicPractice from "@/pages/TopicPractice";
import Administrative from "@/pages/Administrative";
import { useAuthUser } from "@/components/layout/Layout";
import { LogIn } from "lucide-react";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function LoginScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
          AI
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">AI Logic</h1>
          <p className="text-muted-foreground text-sm">by Zhi Systems</p>
        </div>
        <p className="text-muted-foreground">
          Sign in with your Google account to access the course.
        </p>
        <a
          href="/api/auth/google"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 w-full justify-center"
          data-testid="link-login"
        >
          <LogIn className="w-4 h-4" />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.authenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/assignments/:id" component={AssignmentRunner} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/assessments/run/:attemptId" component={AssessmentRunner} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/administrative" component={Administrative} />
      <Route path="/diagnostics" component={Diagnostics} />
      <Route path="/weeks/:weekNumber" component={WeekView} />
      <Route path="/lectures/:lectureId" component={LectureView} />
      <Route path="/practice/topic/:topicId" component={TopicPractice} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthGate>
            <AppRoutes />
          </AuthGate>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
