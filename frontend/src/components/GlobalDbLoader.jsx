import React, { useState, useEffect, useRef } from 'react';
import { Cloud, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { subscribeDbCalls } from '../services/api';

export default function GlobalDbLoader() {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(1);
  const [statusState, setStatusState] = useState(null); // 'success' | 'error' | null
  const timerRef = useRef(null);
  const completeTimerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeDbCalls((isLoading, activeCount, action, success = true, error = null) => {
      if (isLoading) {
        if (completeTimerRef.current) {
          clearTimeout(completeTimerRef.current);
          completeTimerRef.current = null;
        }
        setStatusState(null);
        setActive(true);
      } else {
        setActive(false);
        if (success !== false && !error) {
          setStatusState('success');
          completeTimerRef.current = setTimeout(() => {
            setStatusState(null);
            setSeconds(1);
          }, 1200);
        } else {
          // If transaction failed, NEVER show false "Synced" checkmark!
          setStatusState('error');
          completeTimerRef.current = setTimeout(() => {
            setStatusState(null);
            setSeconds(1);
          }, 1500);
        }
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

  if (!active && !statusState) {
    return null;
  }

  const isSuccess = statusState === 'success';
  const isError = statusState === 'error';

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
        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(37, 99, 235, 0.25)',
        border: isSuccess 
          ? '1px solid rgba(16, 185, 129, 0.7)' 
          : isError
          ? '1px solid rgba(239, 68, 68, 0.7)'
          : '1px solid rgba(59, 130, 246, 0.45)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'inherit',
        animation: 'slideUpExcelLoader 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '410px',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      {/* Cloud Icon Badge with Status Indicator */}
      <div
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: isSuccess 
            ? '#10b981' 
            : isError
            ? '#ef4444'
            : '#2563eb', // Royal Blue Cloud Sync
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isSuccess 
            ? '0 2px 8px rgba(16, 185, 129, 0.4)' 
            : isError
            ? '0 2px 8px rgba(239, 68, 68, 0.4)'
            : '0 2px 8px rgba(37, 99, 235, 0.4)',
          transition: 'background-color 0.2s ease'
        }}
      >
        {isSuccess ? (
          <Check size={20} color="#ffffff" strokeWidth={3} />
        ) : isError ? (
          <AlertCircle size={20} color="#ffffff" strokeWidth={2.5} />
        ) : (
          <Cloud size={20} color="#ffffff" />
        )}

        {/* Live Pulse Dot */}
        {active && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              border: '2px solid #0f172a'
            }}
          />
        )}
      </div>

      {/* Message and Live Seconds Counter */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {active ? (
            <RefreshCw size={12} className="spin-animation" style={{ color: '#38bdf8' }} />
          ) : isSuccess ? (
            <Check size={12} style={{ color: '#34d399' }} strokeWidth={3} />
          ) : (
            <AlertCircle size={12} style={{ color: '#f87171' }} strokeWidth={2.5} />
          )}
          <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            {isSuccess 
              ? 'Cloud Synced' 
              : isError 
              ? 'Sync Interrupted' 
              : 'Syncing with Cloud...'}
          </span>
        </div>

        <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.35' }}>
          {isSuccess ? (
            <span style={{ color: '#6ee7b7', fontWeight: '500' }}>Saved securely in {seconds}s</span>
          ) : isError ? (
            <span style={{ color: '#fca5a5', fontWeight: '500' }}>Connection notice in {seconds}s</span>
          ) : (
            <>
              Securely saving your records, please hold on...{' '}
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {seconds}s
              </strong>
            </>
          )}
        </p>
      </div>

      {/* Prominent Seconds Counter Badge */}
      {active && (
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
