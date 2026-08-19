import { useDispatch, useSelector } from "react-redux"
import { register, login } from '../service/auth.api'
import { setUser, setError, setLoading } from '../state/auth.slice'

const useAuth = () => {
    const dispatch = useDispatch()
    const { user, loading, error } = useSelector((state) => state.auth)

    async function handleRegister({ email, fullname, contact, password, isSeller = false }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await register({ email, fullname, contact, password, isSeller })
            dispatch(setUser(data?.user || data))
            return { success: true, data }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.'
            dispatch(setError(errorMessage))
            return { success: false, error: errorMessage }
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await login({ email, password })
            dispatch(setUser(data?.user || data))
            return { success: true, data }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.'
            dispatch(setError(errorMessage))
            return { success: false, error: errorMessage }
        } finally {
            dispatch(setLoading(false))
        }
    }

    return { handleRegister, handleLogin, user, loading, error }
} 

export default useAuth
