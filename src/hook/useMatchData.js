import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "./useWebSocket";
import { fetchMatches } from "../services/api";
export const useMatchData = () => {
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const handleWSMessage = useCallback((message) => {
        // Handle incoming WebSocket messages here
        console.log("Received WebSocket message:", message);
    }, []);
    const {
        status,
        connectGlobal,

    } = useWebSocket(handleWSMessage);
    const loadMatches = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchMatches(100);
            setMatches(data);
        } catch (e) {
            console.error("Error fetching matches:", e);
        } finally {
            setIsLoading(false);
        }
    });

    useEffect(() => {
        loadMatches();
    }, []);
    useEffect(() => {
        connectGlobal();
    }, [connectGlobal]);
    return { matches, isLoading, status };
}
