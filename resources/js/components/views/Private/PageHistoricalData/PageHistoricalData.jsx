import HistoricalDataContent from "./components/HistoricalDataContent";
import useWindowDimensions from "../../../providers/useWindowDimensions";

export default function PageHistoricalData() {
    const { width } = useWindowDimensions();

    return (
        <HistoricalDataContent
            width={width}
            historicalable_type={[]}
            from="PageHistoricalData"
        />
    );
}
