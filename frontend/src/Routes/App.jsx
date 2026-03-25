import { useState } from 'react'
import './App.css'
import { Outlet } from 'react-router';
import Footer from '../Components/Footer';
import Navbar from '../Components/Navbar';

function App() {
  
  return (
    <>
    <Navbar/>
    <Outlet />
    <Footer />
    
    </>
  )
}

export default App
