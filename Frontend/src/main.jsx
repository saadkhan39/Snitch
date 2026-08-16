import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import "./app/App.css"
import { store } from './app/app.store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}>
     <App />
   </Provider>
  </StrictMode>,
)
