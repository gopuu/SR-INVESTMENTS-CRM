import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudDownload, 
  CloudUpload, 
  Trash2, 
  RotateCcw, 
  RefreshCw, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { subscribeDbCalls } from '../services/api';

/**
 * Returns dynamic contextual titles, subtitles, icons, and theme colors
 * based on the database action being executed (Load vs Save vs Delete vs Restore).
 */
function getActionConfig(actionName) {
  const act = String(actionName || '').toLowerCase().trim();

  // 1. Delete / Remove / Archive Actions
  if (act.startsWith('delete') || act.startsWith('remove') || act.startsWith('archive') || act.startsWith('purge')) {
    return {
      category: 'delete',
      loadingTitle: 'Deleting Record...',
      loadingSubtitle: 'Removing record from cloud database, please hold on...',
      successTitle: 'Record Deleted',
      successSubtitle: (s) => `Record removed in ${s}s`,
      accentColor: '#ef4444',
      badgeBg: '#dc2626',
      icon: Trash2
    };
  }

  // 2. Save / Create / Update Actions
  if (act.startsWith('save') || act.startsWith('create') || act.startsWith('update') || act.startsWith('add') || act.startsWith('setup') || act.startsWith('post')) {
    return {
      category: 'save',
      loadingTitle: 'Saving to Cloud...',
      loadingSubtitle: 'Securely saving your records, please hold on...',
      successTitle: 'Saved Successfully',
      successSubtitle: (s) => `Saved securely in ${s}s`,
      accentColor: '#3b82f6',
      badgeBg: '#2563eb',
      icon: CloudUpload
    };
  }

  // 3. Restore / Recover Actions
  if (act.startsWith('restore') || act.startsWith('recover') || act.startsWith('unarchive')) {
    return {
      category: 'restore',
      loadingTitle: 'Restoring Record...',
      loadingSubtitle: 'Restoring record from archive, please hold on...',
      successTitle: 'Record Restored',
      successSubtitle: (s) => `Restored in ${s}s`,
      accentColor: '#10b981',
      badgeBg: '#059669',
      icon: RotateCcw
    };
  }

  // 4. Default: Load / Fetch / Query Actions (get*, fetch*, load*, list*, search*, etc.)
  return {
    category: 'load',
    loadingTitle: 'Loading Data...',
    loadingSubtitle: 'Fetching latest records from cloud, please hold on...',
    successTitle: 'Data Loaded',
    successSubtitle: (s) => `Records retrieved in ${s}s`,
    accentColor: '#0284c7',
    badgeBg: '#0284c7',
    icon: CloudDownload
  };
}

export default function GlobalDbLoader() {
  const [active, setActive] = useState(false);
  const [currentAction, setCurrentAction] = useState('load');
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
        if (action) {
          setCurrentAction(action);
        }
        setStatusState(null);
        setActive(true);
      } else {
        setActive(false);
        if (action) {
          setCurrentAction(action);
        }
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
  const config = getActionConfig(currentAction);
  const IconComponent = config.icon;

  const currentTitle = isSuccess 
    ? config.successTitle 
    : isError 
    ? 'Sync Interrupted' 
    : config.loadingTitle;

  const currentSubtitle = isSuccess 
    ? config.successSubtitle(seconds)
    : isError 
    ? 'Unable to complete cloud operation' 
    : config.loadingSubtitle;

  const containerBorder = isSuccess 
    ? '1px solid rgba(16, 185, 129, 0.7)' 
    : isError
    ? '1px solid rgba(239, 68, 68, 0.7)'
    : `1px solid ${config.accentColor}66`;

  const badgeBackground = isSuccess 
    ? '#10b981' 
    : isError
    ? '#ef4444'
    : config.badgeBg;

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
        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(0, 0, 0, 0.25)',
        border: containerBorder,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'inherit',
        animation: 'slideUpExcelLoader 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '420px',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      {/* Dynamic Action Icon Badge with Status Indicator */}
      <div
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: badgeBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 2px 8px ${badgeBackground}66`,
          transition: 'background-color 0.2s ease'
        }}
      >
        {isSuccess ? (
          <Check size={20} color="#ffffff" strokeWidth={3} />
        ) : isError ? (
          <AlertCircle size={20} color="#ffffff" strokeWidth={2.5} />
        ) : (
          <IconComponent size={20} color="#ffffff" />
        )}

        {/* Live Pulse Dot while Active */}
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
            <RefreshCw size={12} className="spin-animation" style={{ color: config.accentColor }} />
          ) : isSuccess ? (
            <Check size={12} style={{ color: '#34d399' }} strokeWidth={3} />
          ) : (
            <AlertCircle size={12} style={{ color: '#f87171' }} strokeWidth={2.5} />
          )}
          <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            {currentTitle}
          </span>
        </div>

        <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.35' }}>
          {currentSubtitle}
        </p>
      </div>

      {/* Prominent Seconds Counter Badge */}
      {active && (
        <div
          style={{
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: `${config.accentColor}22`,
            border: `1px solid ${config.accentColor}55`,
            color: config.accentColor,
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
