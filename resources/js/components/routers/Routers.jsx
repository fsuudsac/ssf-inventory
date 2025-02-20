import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigProvider } from "antd";

import RouteList from "./RouteList";

const queryClient = new QueryClient();

const Routers = () => {
    return (
        <ConfigProvider theme={{ hashed: false }}>
            <QueryClientProvider client={queryClient}>
                <Router
                    future={{
                        v7_relativeSplatPath: true,
                        v7_startTransition: true,
                    }}
                >
                    <RouteList />
                </Router>
            </QueryClientProvider>
        </ConfigProvider>
    );
};

export default Routers;

createRoot(document.getElementById("root")).render(<Routers />);
