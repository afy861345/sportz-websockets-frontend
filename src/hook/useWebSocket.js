import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE_URL } from '../constants';

export const useWebSocket = () => {
    const [status, setStatus] = useState('disconnected');
    const ws = useRef(null);
    // Core connect function
    const initConnection = useCallback(() => {
        // Cleanup previous connection
        if (ws.current) {
            ws.current.close();
        }

        // Construct URL
        const socketUrl = `${WS_BASE_URL}`;

        try {
            const socket = new WebSocket(socketUrl);
            ws.current = socket;

            socket.onopen = () => {
                setStatus('connected');
                console.log('[WebSocket] Connected successfully');
            };

            socket.onerror = (event) => {
                // WebSocket error events are generic in browsers and don't contain descriptive messages.
                // We log it to indicate an issue occurred.
                console.warn('[WebSocket] Connection error occurred');

                // Only set error status if we were connected; otherwise let onclose handle it
                if (ws.current?.readyState === WebSocket.OPEN) {
                    setStatus('error');
                }
            };

        } catch (e) {
            console.error('[WebSocket] Connection creation failed:', e);
            setStatus('error');
        }
    }, []);


    useEffect(() => {
        if(ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
            return; // Already connected
        }
        initConnection();
    }, []);

    return { status };
};