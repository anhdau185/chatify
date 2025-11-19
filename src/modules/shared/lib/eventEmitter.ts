type Callback<T = void> = (data?: T) => void;

export class EventEmitter<T = void> {
  private listeners: Set<Callback<T>> = new Set();

  subscribe(cb: Callback<T>): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  emit(data?: T) {
    this.listeners.forEach(cb => void cb(data));
  }

  clear() {
    this.listeners.clear();
  }
}

export default EventEmitter;
