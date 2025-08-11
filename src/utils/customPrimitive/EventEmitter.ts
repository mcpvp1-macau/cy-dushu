class EventEmitter<T extends Record<string, Function>> {
  private _events: Partial<Record<keyof T, Function[]>> = {}

  on(eventName: keyof T, callback: T[keyof T]) {
    this._events[eventName] = this._events[eventName] || []
    this._events[eventName].push(callback)
  }

  off(eventName: keyof T, callback: T[keyof T]) {
    this._events[eventName] = this._events[eventName]?.filter(
      (cb) => cb !== callback,
    )
  }

  emit(eventName: keyof T, ...args: any[]) {
    this._events[eventName]?.forEach((callback) => callback(...args))
  }
}

export default EventEmitter
