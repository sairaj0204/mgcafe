import React from 'react'
import Navbar from '../components/Navbar'

function About() {
    const isLoggedIn = true;
    const current = "About"
  return (
    <Navbar isLoggedIn={isLoggedIn} current={current}/>
  )
}

export default About