import {createBrowserRouter} from "react-router"
import Register from "../features/auth/pages/Register"
import Login from "../features/auth/pages/Login"
import CreateProduct from "../features/product/pages/CreateProduct"
import SellerDashboard from "../features/product/pages/SellerDashboard"
import Protected from "../features/auth/components/Protected"
import Home from "../features/product/pages/Home"
import ProductDetail from "../features/product/pages/ProductDetail"
import SellerProductDetail from "../features/product/pages/SellerProductDetail"


export const routes = createBrowserRouter([
    {
        path:"/",
        element:<Home/>
    },
    {
        path:"/register",
        element:<Register/>
    },
    {
        path:"/login",
        element:<Login/>
    },
    {
       path:"/product/:productId",
       element:<ProductDetail/>
    },
    {
        path:"/seller",
        children:[
            {   
                path:"/seller/create-product",
                element: <Protected role="seller" >
                    <CreateProduct />
                </Protected>
            },
            {
                path:"/seller/dashboard",
                element:<Protected role="seller">
                    <SellerDashboard />
                </Protected>
            },
            {
                path:"/seller/product/:productId",
                element:<Protected role="seller">
                    <SellerProductDetail/>
                </Protected>
            }
        ]
    },
    
])
