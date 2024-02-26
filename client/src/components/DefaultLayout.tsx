'use client'
import { WebSocketProvider } from '@/context/WebsocketContext'
import React from 'react'

const DefaultLayout = ({children}:any) => {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>  
    )
}

export default DefaultLayout
