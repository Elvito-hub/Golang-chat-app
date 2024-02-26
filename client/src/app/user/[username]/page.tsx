'use client'
import NewRoom from '@/components/new-room-form/NewRoom';
import { Badge } from '@/components/ui/badge';
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const page = () => {

  const [rooms, setRooms] = useState<string[]>([]);

    const pathname = usePathname();

    const router = useRouter();


    const name = pathname.split("/").at(-1);

    const handleFetchRooms = async () => {
      fetch("http://localhost:1990/getrooms").then( async (res)=>{
        const json = await res.json();
        if(json.rooms){
          setRooms(json.rooms);
        }
      })
    }


    useEffect(()=>{
      handleFetchRooms();
    },[])

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      {rooms.map((item)=>(
               <Badge variant="default" key={item} className='cursor-pointer' onClick={()=>{
                router.push(`/user/${name}/${item}`)

               }}>
               {item}
             </Badge>
      ))}
      {name ? <NewRoom userName={name} />:null}
    </div>
  )
}

export default page
