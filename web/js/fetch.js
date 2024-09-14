import { Subject } from "rxjs"

const trimSSEString = (str) => str.replaceAll('data:', '').trim()

const sseBlock = document.querySelector('#sse-block')
const sseError = document.querySelector('#sse-error')
const sseComplete = document.querySelector('#sse-complete')

const url = 'http://localhost:4000/events'
const source$ = new Subject()

fetch(url)
  .then(async (res) => {
    if (!res.ok) {
      const error = await res.text()
      throw new Error(error)
    }

    const { body } = res
    if (!body) {
      throw new Error('沒有串流內容')
    }

    const reader = body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    while (true) {
      const {value, done} = await reader.read();

      if (done) {
        source$.complete()
        break;
      }

      const lines = value.trim().split('\n\n')
      const lastLine = trimSSEString(lines.at(-1) || '')

      if (lastLine.includes('[DONE]')) {
        const lastDataLine = lines.reverse().reduce(
          (target, line) => target || (line.includes('[DONE]') ? '' : line),
          ''
        )
        if (lastDataLine) {
          source$.next((lastDataLine))
        }
        continue
      }

      source$.next(lastLine)
    }
  })
  .catch((err) => {
    console.log(err.message)
    source$.error(err)
  })

source$.subscribe({
  next: (data) => {
    sseBlock.textContent = data
  },
  error: (error) => {
    sseError.textContent = '發生了錯誤，請稍後再試'
  },
  complete: () => {
    sseComplete.textContent = '串流結束'
  }
})