import { useCallback, useEffect, useState, useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { fetchMatches, fetchMatchCommentary } from "../services/api";
export const useMatchData = () => {
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentary, setCommentary] = useState([]);
    const [isCommentaryLoading, setIsCommentaryLoading] = useState(false);
    const [wsError, setWsError] = useState(null);
    const [activeMatchId, setActiveMatchId] = useState(null);
    const [newMatchesCount, setNewMatchesCount] = useState(0);
    const latestMatchIdRef = useRef(null);
    const subscribedMatchIdsRef = useRef(new Set());
    const hasLoadedRef = useRef(false);
    const knownMatchIdsRef = useRef(new Set());
    const newMatchesTimeoutRef = useRef(null);
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
            setMatches((prevMatches) => {
                const prevById = new Map(
                    prevMatches.map((match) => [String(match.id), match])
                );

                return nextMatches.map((match) => {
                    const matchId = String(match.id);
                    const prev = prevById.get(matchId);
                    if (prev && subscribedMatchIdsRef.current.has(matchId)) {
                        return {
                            ...match,
                            homeScore: prev.homeScore,
                            awayScore: prev.awayScore,
                        };
                    }
                    return match;
                });
            });
            if (knownMatchIdsRef.current.size > 0) {
                let newCount = 0;
                nextMatchIds.forEach((matchId) => {
                    if (!knownMatchIdsRef.current.has(matchId)) {
                        newCount += 1;
                    }
                });
                if (newCount > 0) {
                    setNewMatchesCount((prev) => prev + newCount);
                    if (newMatchesTimeoutRef.current) {
                        clearTimeout(newMatchesTimeoutRef.current);
                    }
                    newMatchesTimeoutRef.current = setTimeout(() => {
                        setNewMatchesCount(0);
                        newMatchesTimeoutRef.current = null;
                    }, 5000);
                }
            }


            knownMatchIdsRef.current = nextMatchIds;
            nextMatches.forEach((match) => {
                const matchId = String(match.id);
                if (subscribedMatchIdsRef.current.has(matchId) && match.status.toLowerCase() === "finished") {
                    subscribedMatchIdsRef.current.delete(matchId);
                    unsubscribeMatch(match.id);
                    if (latestMatchIdRef.current == match.id) {
                        setActiveMatchId(null);
                        latestMatchIdRef.current = null;
                        setCommentary([]);
                        setIsCommentaryLoading(false);
                    }
                }
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to load matches";
            setError(msg);
        } finally {
            if (!hasLoadedRef.current) {
                setIsLoading(false);
                hasLoadedRef.current = true;
            }
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
    useEffect(() => {
        latestMatchIdRef.current = activeMatchId;
    }, [activeMatchId]);

    useEffect(() => {
        return () => {
            if (newMatchesTimeoutRef.current) {
                clearTimeout(newMatchesTimeoutRef.current);
            }
        };
    }, []);
    const dismissNewMatches = useCallback(() => {
        if (newMatchesTimeoutRef.current) {
            clearTimeout(newMatchesTimeoutRef.current);
            newMatchesTimeoutRef.current = null;
        }
        setNewMatchesCount(0);
    }, []);

    const watchMatch = useCallback(
        (id) => {
            setCommentary([]);
            setIsCommentaryLoading(true);
            setWsError(null);
            latestMatchIdRef.current = id;
            if (activeMatchId != null && activeMatchId != id) {
                const previousId = String(activeMatchId);
                subscribedMatchIdsRef.current.delete(previousId);
                unsubscribeMatch(activeMatchId);
            }
            setActiveMatchId(id);
            const matchId = String(id);
            subscribedMatchIdsRef.current.add(matchId);
            subscribeMatch(id);
            fetchMatchCommentary(id)
                .then((data) => {
                    if (latestMatchIdRef.current == id) {
                        setCommentary(data.data || []);
                    }
                })
                .catch(() => {
                    if (latestMatchIdRef.current == id) {
                        setCommentary([]);
                    }
                })
                .finally(() => {
                    if (latestMatchIdRef.current == id) {
                        setIsCommentaryLoading(false);
                    }
                });
        },
        [activeMatchId, subscribeMatch, unsubscribeMatch]
    );

    const unwatchMatch = useCallback(
        (id) => {
            unsubscribeMatch(id);
            const matchId = String(id);
            subscribedMatchIdsRef.current.delete(matchId);
            if (activeMatchId == id) {
                setActiveMatchId(null);
                latestMatchIdRef.current = null;
                setCommentary([]);
                setIsCommentaryLoading(false);
            }
        },
        [activeMatchId, unsubscribeMatch]
    );
    return { matches, isLoading, status, error, commentary, isCommentaryLoading, wsError, activeMatchId, newMatchesCount, dismissNewMatches, watchMatch, unwatchMatch };
}
