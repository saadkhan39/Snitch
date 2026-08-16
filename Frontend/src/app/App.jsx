import React from 'react'
import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './AppRoutes'

const App = () => {
  return (
    <div>
      <RouterProvider router={routes} />
    </div>
  )
}

export default App