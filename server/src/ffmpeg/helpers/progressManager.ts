import { Observable, ReplaySubject } from 'rxjs';
import { Queue } from 'bullmq';

type ProgressStreamType = Map<string, ReplaySubject<ProgressMessage>>;

export type ProgressMessage = {
  type: string;
  data: Record<string, unknown>;
};

export class ProgressStreamManager {
  progressStreams: ProgressStreamType;
  private queue: Queue | null;

  constructor(progressStreams: ProgressStreamType, queue?: Queue) {
    this.progressStreams = progressStreams;
    this.queue = queue || null;
  }

  getStream(jobId: string) {
    return this.progressStreams.get(jobId);
  }

  getProgressStream(jobId: string): Observable<ProgressMessage> {
    this.initProgress(jobId);
    const stream = this.progressStreams.get(jobId);
    if (!stream) throw new Error('Progress stream not initialized');
    return stream.asObservable();
  }

  initProgress(jobId: string) {
    if (!this.progressStreams.has(jobId)) {
      this.progressStreams.set(jobId, new ReplaySubject<ProgressMessage>(1));
    }
  }

  async emitProgress(jobId: string, percent: number) {
    const stream = this.progressStreams.get(jobId);
    if (stream) {
      stream.next({ type: 'progress', data: { percent } });
    }

    if (this.queue) {
      await this.queue.add('progress', {
        jobId,
        type: 'progress',
        data: { percent },
      });
    }
  }

  completeProgress(jobId: string) {
    const stream = this.progressStreams.get(jobId);
    if (!stream) return;
    stream.next({ type: 'complete', data: { percent: 100 } });
    stream.complete();
    this.progressStreams.delete(jobId);
  }

  failProgress(jobId: string, error: Error) {
    const stream = this.progressStreams.get(jobId);
    if (!stream) return;
    stream.next({
      type: 'error',
      data: { message: error.message },
    });
    stream.complete();
    this.progressStreams.delete(jobId);
  }
}
