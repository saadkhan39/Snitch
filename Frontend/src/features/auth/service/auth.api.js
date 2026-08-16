import axios from "axios"

const api = axios.create({
    baseURL:"http://localhost:3000/api/auth",
    withCredentials:true
})

export async function register({fullname,email,password,contact,isSeller}) {
    
    const response = await api.post("/register",{
        fullname,email,password,contact,isSeller
    })
    return response.data
}