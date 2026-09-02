import React from 'react'
import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './AppRoutes'
import useAuth from '../features/auth/hooks/useAuth'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'


const App = () => {

   const { handleGetMe } = useAuth()
   
   const user  = useSelector((state) => state.auth.user)

   console.log(user);

   useEffect(() => {
     handleGetMe()
   },[])
   


  return (
    <div>
      <RouterProvider router={routes} />
    </div>
  )
}

export default App