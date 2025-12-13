import Footer from '@/components/Footer'
import Navbar from '@/components/navbar'
import ScrollAtTop from '@/components/ScrollAtTop'
import React from 'react'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div>
      <ScrollAtTop/>
        <Navbar/>
        <div>
         <Outlet/>   
        </div>
        <Footer/>
    </div>
  )
}

export default MainLayout