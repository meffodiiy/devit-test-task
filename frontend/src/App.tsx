import React, { FC, useEffect, useRef, useState } from 'react'
import * as styles from './App.css'
import LongPollingController from './LongPollingController'


const LONG_POLLING_URL = '/api'
const LONG_POLLING_REQUEST_AMOUNT = 1000


export const App: FC = () => {

  const abortController = useRef(new AbortController).current
  const longPollingController = useRef(new LongPollingController(LONG_POLLING_URL, LONG_POLLING_REQUEST_AMOUNT, abortController.signal)).current
  const inputRef = useRef<HTMLInputElement>(null)
  const [isButtonEnabled, setIsButtonEnabled] = useState(false)
  const [items, setItems] = useState<string[]>([])

  const appendItem = (index: string) => setItems(prev => [...prev, index])

  useEffect(() => {
    longPollingController
      .onStart(() => {
        setIsButtonEnabled(false)
        inputRef.current!.disabled = true
      })
      .onRequestFinish(response => {
        if (response.status !== 200) return
        response.text().then(appendItem)
      })
      .onEnd(() => {
        setIsButtonEnabled(true)
        inputRef.current!.disabled = false
      })

    return () => {
      abortController.abort()
    }
  }, [])

  const onChange = () => setIsButtonEnabled(inputRef.current!.checkValidity())
  
  const onClick = () => {
    setItems([])
    longPollingController.startLongPollingSession(+inputRef.current!.value)
  }

  return (
    <main className={styles.root}>
      <div className={styles.inputPanel}>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Enter number from 0 to 100"
          type="number"
          min={0} max={100}
          required
          onChange={onChange}
        />
        <button
          className={styles.startBtn}
          disabled={!isButtonEnabled}
          onClick={onClick}
        >
          START
        </button>
      </div>
      {items.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <td>Response</td>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr className={styles.row} key={index}>
                <td>{index + 1}</td>
                <td width="99%">{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        'Nothing yet'
      )}
    </main>
  )
}



