import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BaseLayout from "../src/components/base-layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ErrorBoundary from "../src/components/error-boundary";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <BaseLayout>
          <App />
        </BaseLayout>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
