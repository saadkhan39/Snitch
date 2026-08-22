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

    if (result?.success) {
      setSuccessMessage('Welcome back to Snitch! Logging you in...')
      setTimeout(() => {
        navigate('/')
      }, 1500)
    }
  }

  return (
    <div className="h-screen w-screen bg-[#0D0E13] text-[#E2E8F0] overflow-hidden flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-500/30 selection:text-amber-300">
      
      {/* ================= LEFT SIDE: EDITORIAL HERO IMAGE (NEW IMAGE) ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative h-full flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#0A0B0E]">
        {/* Background Fashion Photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="/snitch-login.jpg"
            alt="Snitch Fashion Editorial"
            className="w-full h-full object-cover object-top filter grayscale contrast-[1.12] brightness-[0.85]"
          />
          {/* Multi-layered dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-transparent to-[#0A0B0E]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0D0E13]" />
        </div>

        {/* Top-Left: SNITCH. Logo in Golden Yellow */}
        <div className="relative z-10">
          <Link to="/">
            <span className="text-xl xl:text-2xl font-extrabold tracking-[0.2em] text-[#F59E0B] font-['Space_Grotesk']">
              SNITCH.
            </span>
          </Link>
        </div>

        {/* Bottom-Left: "Redefine your presence." */}
        <div className="relative z-10 space-y-2">
          <h2 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-none font-['Space_Grotesk']">
            Redefine your <br />
            <span className="text-[#F59E0B]">presence.</span>
          </h2>
          <p className="text-sm xl:text-base text-slate-300 font-normal tracking-wide pt-1">
            Step into exclusive collections, streetwear drops &amp; bespoke fashion
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE: MINIMAL SIGN-IN FORM ================= */}
      <div className="flex-1 h-full flex flex-col justify-center px-8 sm:px-14 md:px-20 xl:px-24 py-8 bg-[#0D0E13] relative overflow-hidden">
        
        {/* Mobile Header only */}
        <div className="flex lg:hidden items-center justify-between mb-6">
          <span className="text-xl font-bold tracking-[0.2em] text-[#F59E0B] font-['Space_Grotesk']">
            SNITCH.
          </span>
          <Link
            to="/register"
            className="text-xs text-[#F59E0B] hover:underline"
          >
            Create Account
          </Link>
        </div>

       <div className="w-full max-w-sm mx-auto">

  {/* Header */}
  <div className="mb-4">
    <span className="block text-[10px] font-bold tracking-[0.2em] text-[#F59E0B] uppercase font-['Space_Grotesk'] mb-1">
      WELCOME BACK
    </span>

    <h1 className="text-2xl font-bold text-white tracking-tight font-['Space_Grotesk']">
      Access Your Account
    </h1>
  </div>

  {/* Error Message */}
  {(localError || error) && (
    <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs animate-fadeIn">
      <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{localError || error}</span>
    </div>
  )}

  {/* Success Message */}
  {successMessage && (
    <div className="mb-3 p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center gap-2 text-amber-300 text-xs animate-fadeIn">
      <FiCheck className="w-4 h-4 flex-shrink-0 text-amber-400" />
      <span>{successMessage}</span>
    </div>
  )}

  {/* Sign-In Form */}
  <form onSubmit={handleSubmit} className="space-y-3">

    {/* Email Address */}
    <div className="space-y-1">
      <label
        htmlFor="email"
        className="block text-[11px] font-medium text-slate-300 tracking-wide"
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
        className="w-full bg-white/[0.03] text-white px-3 py-2 rounded-t-md border-b border-white/20 focus:border-[#F59E0B] text-sm placeholder-slate-500 focus:outline-none transition-colors duration-200"
      />
    </div>

    {/* Password */}
    <div className="space-y-1">
      <label
        htmlFor="password"
        className="block text-[11px] font-medium text-slate-300 tracking-wide"
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
          className="w-full bg-white/[0.03] text-white pl-3 pr-9 py-2 rounded-t-md border-b border-white/20 focus:border-[#F59E0B] text-sm placeholder-slate-500 focus:outline-none transition-colors duration-200"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#F59E0B] transition-colors focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <FiEyeOff className="w-4 h-4" />
          ) : (
            <FiEye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>

    {/* Sign In Button */}
    <div className="pt-1">
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#F59E0B] hover:bg-[#e08e06] text-black font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)] disabled:opacity-60 disabled:cursor-not-allowed text-sm font-['Space_Grotesk'] tracking-wide"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          "Sign In"
        )}
      </button>
    </div>

     {/* Divider */}
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[9px] text-slate-500 uppercase tracking-wider">
        or
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>

    {/* Google */}
   <ContinueWithGoogle/>

    {/* Sign Up Link */}
    <div className="text-center pt-1">
      <span className="text-[11px] text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="text-white hover:text-[#F59E0B] font-medium transition-colors ml-1"
        >
          Sign Up
        </Link>
      </span>
    </div>

  </form>
</div>
      </div>
    </div>
  )
}

export default Login