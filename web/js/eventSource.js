import { Subject } from "rxjs"

const url = 'http://localhost:4000/events'
const source$ = new Subject()

const sseBlock = document.querySelector('#sse-block')
const sseError = document.querySelector('#sse-error')
const sseComplete = document.querySelector('#sse-complete')

const eventSource = new EventSource(url)
eventSource.onmessage = (event) => {
  source$.next(event.data)
}
eventSource.onerror = (error) => {
  console.log(error)
  source$.error(error)
}
eventSource.addEventListener('done', () => {
  source$.complete()
})

source$.subscribe({
  next: (data) => {
    sseBlock.textContent = data
  },
  error: (error) => {
    console.log(error)
    eventSource.close()
    sseError.textContent = '發生了錯誤，請稍後再試'
  },
  complete: () => {
    eventSource.close()
    sseComplete.textContent = '串流結束'
  }
})