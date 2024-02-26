'use client'
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

const HomeComp = () => {

    const [name, setName] = useState<string>('');

    const router = useRouter();

  return (
    <div>
    <Label htmlFor="userName">Username</Label>
      <Input value={name} onChange={(e)=>setName(e.target.value)}/>
      <Button variant="default" className='mt-4' onClick={()=>{
        if(name !== ''){
        router.push(`/user/${name}`)
        }
      }}>Login</Button>
    </div>
  )
}

export default HomeComp
