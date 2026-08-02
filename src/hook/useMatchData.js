import { useCallback, useEffect, useState, useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { fetchMatches } from "../services/api";
export const useMatchData = () => {
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentary, setCommentary] = useState([]);
    const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);
    const [wsError, setWsError] = useState(null);

    const latestMatchIdRef = useRef(null);
    const subscribedMatchIdsRef = useRef(new Set());
    const hasLoadedRef = useRef(false);

    const handleWSMessage = useCallback((msg) => {
        switch (msg.type) {
            case "score_update":
                if (!subscribedMatchIdsRef.current.has(String(msg.matchId))) {
                    return;
                }
                setMatches((prevMatches) =>
                    prevMatches.map((m) => {
                        // Loose equality check for ID (string vs number)
                        // eslint-disable-next-line eqeqeq
                        if (m.id == msg.matchId) {
                            return {
                                ...m,
                                homeScore: msg.data.homeScore,
                                awayScore: msg.data.awayScore,
                            };
                        }
                        return m;
                    })
                );
                break;
            case "commentary": {//should {} cause of variable const

                if (
                    latestMatchIdRef.current == null ||
                    msg.data.matchId != latestMatchIdRef.current
                ) {
                    return;
                }
                const normalized = {
                    ...msg.data,
                    createdAt: msg.data.createdAt ?? new Date().toISOString(),
                };
                setCommentary((prev) => [normalized, ...prev]);
                break;

            }
            case "error":
                setWsError(`${msg.code}: ${msg.message}`);
                break;
            case "subscribed":
            case "unsubscribed":
            case "subscribed_all":
            case "unsubscribed_all":
            case "subscriptions":
            case "welcome":
            case "pong":
                break;
            default:
                break;
        }
    }, []);
    const {
        status,
        connectGlobal,
        subscribeMatch,
        unsubscribeMatch,
    } = useWebSocket(handleWSMessage);
    const loadMatches = useCallback(async () => {
        if (!hasLoadedRef.current) {
            setIsLoading(true);
        }
        setError(null);

        try {
            const data = await fetchMatches(100);
            const nextMatches = data.data || [];
            const nextMatchIds = new Set(nextMatches.map((match) => String(match.id)));
            setMatches(nextMatches);
        } catch (e) {
            console.error("Error fetching matches:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMatches();
    }, [loadMatches]);
    useEffect(() => {
        const interval = setInterval(() => {
            loadMatches();
        }, 5000);
        return () => clearInterval(interval);
    }, [loadMatches]);
    useEffect(() => {
        connectGlobal();
    }, [connectGlobal]);
    return { matches, isLoading, status };
}
