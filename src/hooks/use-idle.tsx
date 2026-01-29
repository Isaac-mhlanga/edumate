
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIdleProps {
  onIdle: () => void;
  onActive?: () => void;
  onPrompt?: () => void;
  timeout: number;
  promptTimeout: number;
}

export const useIdle = ({
  onIdle,
  onActive,
  onPrompt,
  timeout,
  promptTimeout,
}: UseIdleProps) => {
  const [isIdle, setIsIdle] = useState(false);
  const [isPrompted, setIsPrompted] = useState(false);

  const idleTimer = useRef<NodeJS.Timeout>();
  const promptTimer = useRef<NodeJS.Timeout>();

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (promptTimer.current) clearTimeout(promptTimer.current);

    // If user was idle or prompted, set them back to active
    if (isIdle || isPrompted) {
      setIsIdle(false);
      setIsPrompted(false);
      onActive?.();
    }
    
    // Set new timers
    promptTimer.current = setTimeout(() => {
      setIsPrompted(true);
      onPrompt?.();
    }, promptTimeout);

    idleTimer.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, timeout);
  }, [onIdle, onActive, onPrompt, timeout, promptTimeout, isIdle, isPrompted]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    const handleEvent = () => {
      resetTimers();
    };
    
    // Set initial timers
    resetTimers();

    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (promptTimer.current) clearTimeout(promptTimer.current);
    };
  }, [resetTimers]);

  return { isIdle, isPrompted, resetTimers };
};
