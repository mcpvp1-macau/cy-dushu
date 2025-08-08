class EventEmitter<T extends Record<string, Function>> {
  private events: Partial<Record<keyof T, Function[]>> = {}

  on(eventName: keyof T, callback: T[keyof T]) {
    this.events[eventName] = this.events[eventName] || []
    this.events[eventName].push(callback)
  }

  off(eventName: keyof T, callback: T[keyof T]) {
    this.events[eventName] = this.events[eventName]?.filter(
      (cb) => cb !== callback,
    )
  }

  emit(eventName: keyof T, ...args: any[]) {
    this.events[eventName]?.forEach((callback) => callback(...args))
  }
}

export default EventEmitter
