import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FiEye, FiEyeOff, FiCheck, FiAlertCircle } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'
import ContinueWithGoogle from '../components/ContinueWithGoogle'

const Login = () => {
  const { handleLogin, loading, error } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (localError) setLocalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    setSuccessMessage('')

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setLocalError('Please enter a valid email address.')
      return
    }
    if (!formData.password) {
      setLocalError('Please enter your password.')
      return
    }

    const result = await handleLogin({
      email: formData.email.trim(),
      password: formData.password,
    })

    if (!result?.success) {
      return
    }

    const userRole = result?.data?.user?.role || result?.data?.role

    setSuccessMessage('Welcome back to Snitch!')

    if (userRole === 'seller') {
      navigate('/seller/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-[#D6D5D3] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex h-full w-full">
      
      {/* ================= LEFT SIDE: EDITORIAL HERO IMAGE (NEW IMAGE) ================= */}
      <div className="hidden lg:flex lg:w-[62%] relative h-full flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#201914]">
        {/* Background Fashion Photo */}
        <div className="absolute inset-0 z-0">
          <video
            src="/model2.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-top"
          />
          {/* Multi-layered dark vignette overlay */}
          <div className="absolute inset-0 bg-[#201914]/[0.08]" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#1d1713]/25 via-transparent to-transparent" />
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <Link to="/">
            <span className="text-[20px] xl:text-[22px] font-bold tracking-[0.2em] text-white drop-shadow-sm">
              SNITCH
            </span>
          </Link>
        </div>

        {/* Bottom-Left: "Redefine your presence." */}
        <div className="relative z-10 space-y-2">
          <h2 className="font-serif text-[58px] xl:text-[76px] leading-[0.86] tracking-[-0.035em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            <span className="italic">Own your</span>
            <br />
            presence.
          </h2>
           <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-8 bg-white/70" />

              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/90 xl:text-xs">
                Curated drops for those who dress on purpose.
              </p>
            </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE: MINIMAL SIGN-IN FORM ================= */}
      <section className="flex h-full flex-1 flex-col items-center justify-center overflow-hidden bg-[#dbd8d8] px-5 sm:px-6 lg:px-8">
        
        {/* Mobile Header only */}
        <div className="mb-6 flex w-full max-w-[300px] items-center justify-between lg:hidden">
          <span className="text-[18px] font-bold tracking-[0.1em] text-[#211D1A]">
            SNITCH
          </span>
          <Link
            to="/register"
            className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#211D1A] hover:underline"
          >
            Create Account
          </Link>
        </div>

      <div className="w-full max-w-[300px]">

  {/* Header */}
  <div className="mb-5">
    <span className="mb-2 block text-[7px] font-bold uppercase tracking-[0.28em] text-[#131212]">
      Welcome back
    </span>

    <h1 className="font-serif text-[27px] leading-none tracking-[-0.03em] text-[#211D1A]">
      Sign in to your account
    </h1>
    <div className="mt-3 h-[2px] w-7 bg-[#211D1A]" />
  </div>

  {/* Error Message */}
  {(localError || error) && (
    <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[9px] text-red-600">
      <FiAlertCircle className="h-3 w-3 shrink-0" />
      <span>{localError || error}</span>
    </div>
  )}

  {/* Success Message */}
  {successMessage && (
    <div className="mb-3 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-[9px] text-green-700">
      <FiCheck className="h-3 w-3 shrink-0" />
      <span>{successMessage}</span>
    </div>
  )}

  {/* Sign-In Form */}
  <form onSubmit={handleSubmit} className="space-y-2.5">

    {/* Email Address */}
    <div>
      <label
        htmlFor="email"
        className="mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-[#625B55]"
      >
        Email Address
      </label>

      <input
        id="email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="hello@example.com"
        required
        className="h-[34px] w-full rounded-[5px] border border-[#D8D1C8] bg-[#F8F6F2] px-3 text-[10px] text-[#211D1A] outline-none transition placeholder:text-[#AAA39B] focus:border-[#211D1A] focus:ring-1 focus:ring-[#211D1A]/10"
      />
    </div>

    {/* Password */}
    <div>
      <label
        htmlFor="password"
        className="mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-[#625B55]"
      >
        Password
      </label>

      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          className="h-[34px] w-full rounded-[5px] border border-[#D8D1C8] bg-[#F8F6F2] px-3 pr-9 text-[10px] text-[#211D1A] outline-none transition placeholder:text-[#AAA39B] focus:border-[#211D1A] focus:ring-1 focus:ring-[#211D1A]/10"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-[#9A928A] transition-colors duration-150 hover:text-[#211D1A]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <FiEyeOff className="h-3 w-3" />
          ) : (
            <FiEye className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>

    {/* Sign In Button */}
    <div className="pt-1">
      <button
        type="submit"
        disabled={loading}
        className="mt-0.5 flex h-[34px] w-full items-center justify-center rounded-[5px] bg-[#131212] px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-200 hover:bg-[#2B2927] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          "Sign In"
        )}
      </button>
    </div>

     {/* Divider */}
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-[#D8D1C8]" />
      <span className="text-[7px] uppercase tracking-[0.15em] text-[#AAA29A]">
        or
      </span>
      <div className="h-px flex-1 bg-[#D8D1C8]" />
    </div>

    {/* Google */}
   <div className="[&_button]:!h-[34px] [&_button]:!rounded-[5px] [&_button]:!border-[#D8D1C8] [&_button]:!bg-[#F8F6F2] [&_button]:!text-[9px] [&_button]:!text-[#4F4842] [&_button:hover]:!bg-[#F1ECE6] [&_button:hover]:!border-[#C9C0B7]">
     <ContinueWithGoogle />
   </div>

    {/* Sign Up Link */}
    <div className="text-center pt-1">
      <span className="text-[10px] text-[#817A73]">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="ml-1.5 text-[10px] font-bold text-[#211D1A] transition-colors duration-150 hover:text-[#211D1A]"
        >
          Sign Up
        </Link>
      </span>
    </div>

  </form>
</div>
      </section>
      </div>
    </main>
  )
}

export default Login