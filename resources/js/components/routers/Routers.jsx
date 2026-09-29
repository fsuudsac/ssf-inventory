import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigProvider, App } from "antd";

import RouteList from "./RouteList";
import { AntdAppHolder } from "../providers/antdAppHelper";
import { ProcurementRealtimeProvider } from "../providers/ProcurementRealtimeProvider";

const queryClient = new QueryClient();

const Routers = () => {
    return (
        <ConfigProvider theme={{ hashed: false }}>
            <App>
                <AntdAppHolder />
                <QueryClientProvider client={queryClient}>
                    <ProcurementRealtimeProvider>
                        <Router
                            future={{
                                v7_relativeSplatPath: true,
                                v7_startTransition: true,
                            }}
                        >
                            <RouteList />
                        </Router>
                    </ProcurementRealtimeProvider>
                </QueryClientProvider>
            </App>
        </ConfigProvider>
    );
};

export default Routers;

createRoot(document.getElementById("root")).render(<Routers />);
