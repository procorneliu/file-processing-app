import { useCallback, useRef, useState } from 'react';
import type { ProcessedFile } from '../contexts/FileContext';
import axios, { AxiosError } from 'axios';
import { processFile } from '../api/fileProcessing';

const API_BASE = `http://localhost:3000/api/process`;

type JobStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'error';

type StartParams = {
  file: File;
  type: string;
};

type UseProcessingJobReturn = {
  start: (params: StartParams) => Promise<void>;
  cancel: () => Promise<void>;
  status: JobStatus;
  progress: number;
  error: string | null;
  download: ProcessedFile;
};

const noopMessage = (value?: string | null) =>
  value === 'cancelled' || value === undefined || value === null;

export function useProcessingJob(): UseProcessingJobReturn {
  const [status, setStatus] = useState<JobStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [download, setDownload] = useState<ProcessedFile>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const jobIdRef = useRef<string | null>(null);

  const releaseDownload = useCallback((file: ProcessedFile) => {
    if (file?.url && typeof URL !== 'undefined') {
      URL.revokeObjectURL(file.url);
    }
  }, []);

  const cleanupEventSource = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    setProgress(0);
    setError(null);
    setDownload((prev) => {
      if (prev !== null) releaseDownload(prev);
      return null;
    });
  }, [releaseDownload]);

  const cancel = useCallback(async () => {
    const jobId = jobIdRef.current;
    if (!jobId) return;

    cleanupEventSource();
    jobIdRef.current = null;

    try {
      await axios.post(`${API_BASE}/cancel/${jobId}`);
    } catch (err) {
      console.log('Failed to cancel job', err);
    } finally {
      resetState();
      setStatus('cancelled');
    }
  }, [cleanupEventSource, resetState]);

  const start = useCallback(
    async ({ file, type }: StartParams) => {
      if (!file || !type) return;

      await cancel();

      const jobId = crypto.randomUUID();
      jobIdRef.current = jobId;

      resetState();
      setStatus('running');

      const eventSource = new EventSource(`${API_BASE}/progress/${jobId}`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('progress', (event) => {
        const message = event as MessageEvent<string>;

        try {
          const payload = JSON.parse(message.data) as { percent?: number };
          if (typeof payload.percent === 'number') {
            setProgress(payload.percent);
          }
        } catch (parseError) {
          console.log('Failed to parse progress event', parseError);
        }
      });

      eventSource.addEventListener('complete', () => {
        setProgress(100);
        cleanupEventSource();
      });

      eventSource.addEventListener('cancelled', () => {
        cleanupEventSource();
        setStatus('cancelled');
        jobIdRef.current = null;
      });

      eventSource.addEventListener('error', (event) => {
        const message = event as MessageEvent<string>;
        try {
          const payload = JSON.parse(message.data) as { message?: string };
          if (!noopMessage(payload.message)) {
            setError(payload.message ?? 'Processing failed');
            setStatus('error');
          }
        } catch (parseError) {
          console.log('Failed to parse error event', parseError);
        }
        cleanupEventSource();
        jobIdRef.current = null;
      });

      try {
        const result = await processFile(file, type, jobId);
        if (!result) {
          setStatus('cancelled');
          return;
        }
        setDownload(result);
        setStatus('completed');
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.code === AxiosError.ERR_CANCELED) return;
          if (err.response?.status === 204) {
            setStatus('cancelled');
            return;
          }
        }
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Processing failed');
        console.log(err);
      } finally {
        cleanupEventSource();
        jobIdRef.current = null;
      }
    },
    [cancel, cleanupEventSource, resetState],
  );

  return { start, cancel, status, progress, error, download };
}

export default useProcessingJob;
