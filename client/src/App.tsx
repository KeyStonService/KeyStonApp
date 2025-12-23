import { Route, Switch } from "wouter";
import Layout from "./components/Layout";
import ChatPage from "./pages/ChatPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import AuditPage from "./pages/AuditPage";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ChatPage} />
        <Route path="/connections" component={ConnectionsPage} />
        <Route path="/audit" component={AuditPage} />
        <Route>
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Page not found</p>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

export default App;
