import axios from "axios"

const api = axios.create({
    baseURL:"/api/auth",
    withCredentials:true
})

export async function register({fullname,email,password,contact,isSeller}) {
    
    const response = await api.post("/register",{
        fullname,email,password,contact,isSeller
    })
    return response.data
}

export async function login({email, password}) {
    const response = await api.post("/login", {
        email, password
    })
    return response.data
}
