import React, { useState, useEffect, useRef } from 'react';
import { FileSpreadsheet, RefreshCw, Check } from 'lucide-react';
import { subscribeDbCalls } from '../services/api';

export default function GlobalDbLoader() {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(1);
  const [justCompleted, setJustCompleted] = useState(false);
  const timerRef = useRef(null);
  const completeTimerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeDbCalls((isLoading) => {
      if (isLoading) {
        if (completeTimerRef.current) {
          clearTimeout(completeTimerRef.current);
          completeTimerRef.current = null;
        }
        setJustCompleted(false);
        setActive(true);
      } else {
        setActive(false);
        setJustCompleted(true);
        completeTimerRef.current = setTimeout(() => {
          setJustCompleted(false);
          setSeconds(1);
        }, 900);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  // Timer starts from 1sec immediately and increments every second
  useEffect(() => {
    if (active) {
      setSeconds(1);
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active]);

  if (!active && !justCompleted) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999999,
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '12px 18px',
        borderRadius: '14px',
        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(16, 124, 65, 0.3)',
        border: justCompleted 
          ? '1px solid rgba(16, 185, 129, 0.7)' 
          : '1px solid rgba(16, 124, 65, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'inherit',
        animation: 'slideUpExcelLoader 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '390px',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      {/* Excel Icon Badge with Status Indicator */}
      <div
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: justCompleted ? '#10b981' : '#107c41', // Official Excel Green
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: justCompleted 
            ? '0 2px 8px rgba(16, 185, 129, 0.4)' 
            : '0 2px 8px rgba(16, 124, 65, 0.45)',
          transition: 'background-color 0.2s ease'
        }}
      >
        {justCompleted ? (
          <Check size={20} color="#ffffff" strokeWidth={3} />
        ) : (
          <FileSpreadsheet size={20} color="#ffffff" />
        )}

        {/* Live Pulse Dot */}
        {!justCompleted && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#34d399',
              border: '2px solid #0f172a'
            }}
          />
        )}
      </div>

      {/* Message and Live Seconds Counter */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!justCompleted ? (
            <RefreshCw size={12} className="spin-animation" style={{ color: '#34d399' }} />
          ) : (
            <Check size={12} style={{ color: '#34d399' }} strokeWidth={3} />
          )}
          <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            {justCompleted ? 'Excel DB Synced' : 'Syncing with Excel DB...'}
          </span>
        </div>

        <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.35' }}>
          {justCompleted ? (
            <span style={{ color: '#6ee7b7', fontWeight: '500' }}>Transaction completed in {seconds}s</span>
          ) : (
            <>
              backend is excel, it'll take some time, wait{' '}
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {seconds}s
              </strong>
            </>
          )}
        </p>
      </div>

      {/* Prominent Seconds Counter Badge */}
      {!justCompleted && (
        <div
          style={{
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: '800',
            fontFamily: 'monospace',
            flexShrink: 0
          }}
        >
          {seconds}s
        </div>
      )}
    </div>
  );
}
