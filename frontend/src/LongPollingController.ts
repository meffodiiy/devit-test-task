
type onStartCallback = () => void
type onEndCallback = () => void
type onRequestFinishCallback = (response: Response) => void


export default class LongPollingController {

  private onStartCallback?: onStartCallback
  private onEndCallback?: onEndCallback
  private onRequestFinishCallback?: onRequestFinishCallback
  private requestsMade = 0


  constructor (
    private readonly url: string,
    private readonly requestAmount: number,
    private readonly abortSignal: AbortSignal
  ) {}

  private trackResponse (requestIndex: number) {
    return (response: Response) => {
      this.onRequestFinishCallback?.(response)

      if (this.requestsMade === this.requestAmount) {
        if (requestIndex === this.requestAmount - 1) {
          this.onEndCallback?.()
        }
        return
      }

      this.makeRequest()
    }
  }

  private makeRequest () {
    const index = this.requestsMade

    fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      signal: this.abortSignal,
      body: index.toString()
    })
      .then(this.trackResponse(index))
      .catch(this.trackResponse(index))

    this.requestsMade++
  }


  public onStart (callback: () => void): LongPollingController {
    this.onStartCallback = callback
    return this
  }

  public onEnd (callback: () => void): LongPollingController {
    this.onEndCallback = callback
    return this
  }

  public onRequestFinish (callback: onRequestFinishCallback): LongPollingController {
    this.onRequestFinishCallback = callback
    return this
  }

  public startLongPollingSession (concurrency: number) {
    this.requestsMade = 0
    this.onStartCallback?.()
    for (let _ = 0; _ < concurrency; _++) {
      this.makeRequest()
    }
  }
}
