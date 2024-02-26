'use client'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WebSocketContext, { WebSocketProvider } from '@/context/WebsocketContext';
import { usePathname } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'

const Page = () => {

  const [newMessage, setNewMessage] = useState<string>('');

    const pathname = usePathname();

    const thewebcon = useContext(WebSocketContext);

    if(thewebcon === null){
      return <div>socket not available</div>
    }

    const { connectToRoom, sendMessage, messages, error, roomMembers } = thewebcon;

    console.log("hehee")


    const roomId = pathname.split("/").at(-1);
    const name = pathname.split("/").at(-2);

    useEffect(() => {
      // Connect when the roomId changes
      if (roomId && name && !roomMembers.includes(name)) {
        console.log("connecting to room");
        connectToRoom(roomId, name);
      }
  
      // Cleanup - Consider closing a connection when the component unmounts 
      // or the roomId changes 
      // return () => { 
      //   if (roomId) {
      //   closeRoomConnection(roomId)
      //   }
      // }
    }, []);

  return (
    <div className='h-screen p-4'>
      <Badge className='px-2 py-2 flex justify-center rounded-none'>
        {roomId}
      </Badge>
      <div className='flex flex-row h-[90%] gap-3'>
    <div className='w-[80%] border flex flex-col p-2'>
      <div className='grid grid-flow-row overflow-y-auto p-2 gap-2'>
              {messages.map((mesg:any,index)=>(
              <div className={ `flex flex-col border w-fit rounded-md ${mesg.userName===name ? 'justify-self-end' : ''}`} key={index}>
                  <div className='bg-[#8f71ff] p-1 rounded-md rounded-t rounded-b-none font-bold'>{mesg.userName}</div>
                  <div className='p-2'>{mesg.message}</div>
               <div className='p-1 bg-yellow-200 rounded-md rounded-b rounded-t-none'>{new Date(mesg.dateSent).toUTCString()}</div>
      </div>
    ))}
    </div>
    <div className='justify-self-end'>
    <Input value={newMessage} onChange={(e)=>setNewMessage(e.target.value)}/>
      <Button variant="default" className='mt-4' onClick={()=>{
        if(newMessage!=='' && roomId){
           console.log('hereee')
          sendMessage(roomId,{
            userName: name,
            message: newMessage,
            dateSent: new Date().toISOString()
          });
          setNewMessage('');
        }
      }}>Send Message</Button> 
      </div>   
    </div>  
    <div className='w-[20%] h-full border'>
      <h1>Online Users</h1>
      {roomMembers.map((item)=>(
        <Badge variant="default" key={item}>
            {item}
          </Badge>
      ))}
    </div>
    </div>
    </div>
  )
}

export default Page
