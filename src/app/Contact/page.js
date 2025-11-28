import React from 'react'
import Navbar from '../components/Navbar'

function Contact() {
    const isLoggedIn = true;
    const current = "Contact"
  return (
    <Navbar isLoggedIn={isLoggedIn} current={current}></Navbar>
  )
}

export default Contact