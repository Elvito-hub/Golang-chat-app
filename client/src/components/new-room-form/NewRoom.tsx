'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { Label } from '../ui/label'

interface RoomsProps {
    userName: string
}

const NewRoom = ({userName}:RoomsProps) => {

    const [name, setName] = useState<string>('');

    const router = useRouter();

  return (
    <div>
    <Label htmlFor="userName">Room Name</Label>
    <Input value={name} onChange={(e)=>setName(e.target.value)}/>
      <Button variant="default" className='mt-4' onClick={()=>{
        if(name !== ''){
        router.push(`/user/${userName}/${name}`)
        }
      }}>New Room</Button>
    </div>
  )
}

export default NewRoom
