import { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { processFile } from '../../api/fileProcessing';
import { useCard } from '../../contexts/CardContext';
import { useFile } from '../../contexts/FileContext';
import Button from '../../ui/Button';

function CardSettings() {
  const { activeCard } = useCard();
  const { file, processedFile, setProcessedFile } = useFile();
  const [jobId, setJobId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const jobIdRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, []);

  useEffect(() => {
    jobIdRef.current = jobId;
  }, [jobId]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    if (activeCard?.id === undefined) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const currentJobId = jobIdRef.current;
    if (currentJobId && isProcessingRef.current) {
      void axios
        .post(`http://localhost:3000/api/process/cancel/${currentJobId}`)
        .catch((error) => {
          console.log('Failed to cancel job on card switch', error);
        });
    }

    setProcessedFile(null);
    setProgress(0);
    setErrorMessage(null);
    setIsProcessing(false);
    setJobId(null);
    isProcessingRef.current = false;
    jobIdRef.current = null;
  }, [activeCard?.id, setProcessedFile]);

  const card = activeCard;
  if (!card) return null;

  const { title, body, type: processType } = card;

  async function handleClickAction() {
    if (!file || !processType || isProcessing) {
      setProcessedFile(null);
      return;
    }

    if (jobId) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      await axios
        .post(`http://localhost:3000/api/process/cancel/${jobId}`)
        .catch((error) => {
          console.log('Failed to cancel existing job', error);
        });
    }

    const nextJobId = crypto.randomUUID();
    jobIdRef.current = nextJobId;
    setJobId(nextJobId);

    setProcessedFile(null);
    setErrorMessage(null);
    setIsProcessing(true);
    isProcessingRef.current = true;
    setProgress(0);

    const eventSource = new EventSource(
      `http://localhost:3000/api/process/progress/${nextJobId}`,
    );

    eventSourceRef.current?.close();
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
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    });

    eventSource.addEventListener('cancelled', () => {
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    });

    eventSource.addEventListener('error', (event) => {
      const message = event as MessageEvent<string>;
      try {
        const payload = JSON.parse(message.data) as { message?: string };
        if (payload.message && payload.message !== 'cancelled') {
          setErrorMessage(payload.message);
        }
      } catch (parseError) {
        console.log('Failed to parse error event', parseError);
      }
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    });

    try {
      const result = await processFile(file, processType, nextJobId);
      if (!result) {
        return;
      }

      const { url, filename } = result;
      setProcessedFile({ url, filename });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === AxiosError.ERR_CANCELED) {
          return;
        }
        if (error.response?.status === 204) {
          return;
        }
      }

      console.log(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Processing failed');
      }
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
      jobIdRef.current = null;
      setJobId(null);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }

  return (
    <div className="flex flex-col space-y-2 divide-y divide-gray-500 rounded-md border p-7 text-center">
      <h3 className="pb-2 font-bold uppercase">{title}</h3>
      <p className="w-80 pb-2">{body}</p>
      {!isProcessing && !processedFile && (
        <Button action={handleClickAction}>Start Processing</Button>
      )}
      {isProcessing && (
        <div className="w-full pt-4">
          <div className="h-2 w-full rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-blue-500 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-300">{progress}%</p>
        </div>
      )}
      {errorMessage && (
        <p className="pt-2 text-sm text-red-500">{errorMessage}</p>
      )}
      {processedFile && (
        <a
          href={processedFile.url}
          download={processedFile.filename}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Download processed file
        </a>
      )}
    </div>
  );
}

export default CardSettings;
