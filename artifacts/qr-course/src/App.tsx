import { Switch, Route, Router as WouterRouter } from "wouter";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/Landing";
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
import { Layout } from "@/components/layout/Layout";
import {
  AuthGate,
  Administrative,
  useAuth,
  requestLogin,
  isLoginRequiredError,
} from "@/auth";

// When any API call reports that the free preview is used up, pop the
// Google sign-in prompt instead of failing silently.
function onApiError(err: unknown) {
  if (isLoginRequiredError(err)) requestLogin();
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onApiError }),
  mutationCache: new MutationCache({ onError: onApiError }),
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// "/" shows the public landing page to visitors and the dashboard to
// signed-in students. Everything is browsable either way.
function Home() {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? <Dashboard /> : <Landing />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/course" component={Dashboard} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/assignments/:id" component={AssignmentRunner} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/assessments/run/:attemptId" component={AssessmentRunner} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/administrative">
        <Layout>
          <Administrative />
        </Layout>
      </Route>
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
