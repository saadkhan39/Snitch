import React from 'react'
import { FcGoogle } from 'react-icons/fc'


const ContinueWithGoogle = () => {
  return (
     <div>
          <button
            type="button"
            onClick={() => {
              window.location.href =
                "http://localhost:3000/api/auth/google";
            }}
            className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer text-sm font-['Space_Grotesk']"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
  )
}

export default ContinueWithGoogle