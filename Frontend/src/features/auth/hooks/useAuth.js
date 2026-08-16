import React from 'react'
import {useDispatch} from "react-redux"
import { register } from '../service/auth.api'
import { setUser ,setError ,setLoading } from '../state/auth.slice'

const useAuth = () => {
   
    const dispatch = useDispatch()

    async function handleRegister({email, fullname, contact, password , isSeller = false}) {
        
        const data = await register({email, fullname, contact, password , isSeller = false})

        dispatch(setUser(data.user))
    }

  return{ handleRegister}
} 

export default useAuth