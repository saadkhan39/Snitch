import React from 'react'
import { FcGoogle } from 'react-icons/fc'

const ContinueWithGoogle = () => {
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          window.location.href = "http://localhost:3000/api/auth/google"
        }}
        className="
          flex w-full
          items-center justify-center
          gap-3
          rounded-[5px]
          border border-[#D8D1C8]
          bg-[#F8F6F2]
          px-5
          py-2.5
          text-[16px]
          font-bold
          text-[#211D1A]
          transition-all
          duration-200
          hover:bg-[#EDE8E1]
          hover:border-[#C8BFB5]
          cursor-pointer
          font-['Plus_Jakarta_Sans']
        "
      >
        <FcGoogle className="h-5 w-5 shrink-0" />

        <span>
          Continue with Google
        </span>
      </button>
    </div>
  )
}

export default ContinueWithGoogle