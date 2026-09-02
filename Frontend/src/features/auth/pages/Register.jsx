import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FiEye, FiEyeOff, FiCheck, FiAlertCircle } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'
import ContinueWithGoogle from '../components/ContinueWithGoogle'

const Register = () => {
  const { handleRegister, loading, error } = useAuth()

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contact: '',
    password: '',
    isSeller: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const navigate = useNavigate()

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

    if (!formData.fullname.trim()) {
      setLocalError('Please enter your full name.')
      return
    }

    if (!formData.contact.trim()) {
      setLocalError('Please enter your contact number.')
      return
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setLocalError('Please enter a valid email address.')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    const result = await handleRegister({
      fullname: formData.fullname.trim(),
      email: formData.email.trim(),
      contact: formData.contact.trim(),
      password: formData.password,
      isSeller: formData.isSeller,
    })

    if (result?.success) {
      setSuccessMessage('Account created successfully! Welcome to Snitch.')

      setTimeout(() => {
        navigate('/')
      }, 1500)
    }
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-[#D6D5D3] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex h-full w-full">

        {/* =====================================================
            LEFT — VIDEO
        ====================================================== */}
        <section className="relative hidden h-full w-[62%] overflow-hidden lg:block">

          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/model.mp4"
            autoPlay
          muted
            loop
            playsInline
          />

          {/* Soft editorial overlay */}
          <div className="absolute inset-0 bg-[#201914]/[0.08]" />

          {/* Bottom readability gradient */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#1d1713]/25 via-transparent to-transparent" />

          {/* Brand */}
          <div className="absolute left-9 top-8 z-10 xl:left-11 xl:top-9">
            <span className="text-[20px] xl:text-[22px] font-bold tracking-[0.2em] text-white drop-shadow-sm">
              SNITCH
            </span>
          </div>

          {/* Editorial copy */}
          <div className="absolute bottom-10 left-9 z-10 max-w-[500px] xl:left-11 xl:bottom-12">

            <h2 className="font-serif text-[58px] leading-[0.86] tracking-[-0.035em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.08)] xl:text-[76px]">
              <span className="italic">Light, worn</span>
              <br />
              well.
            </h2>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-8 bg-white/70" />

              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/90 xl:text-xs">
                Curated drops for those who dress on purpose.
              </p>
            </div>
          </div>

         
        </section>


       
       {/* =====================================================
    RIGHT — REGISTER
====================================================== */}
<section className="flex h-full flex-1 items-center justify-center overflow-hidden bg-[#dbd8d8] px-5 sm:px-6 lg:px-8">

  <div className="w-full max-w-[300px]">

    {/* Mobile logo */}
    <div className="mb-6 lg:hidden">
      <span className="text-[18px] font-bold tracking-[0.1em] text-[#211D1A]">
        SNITCH
      </span>
    </div>


    {/* Header */}
    <div className="mb-5">

      <p className="mb-2 text-[7px] font-bold uppercase tracking-[0.28em] text-[#131212]">
        Join the movement
      </p>

      <h1 className="font-serif text-[27px] leading-none tracking-[-0.03em] text-[#211D1A]">
        Create your account
      </h1>

     
      <div className="mt-3 h-[2px] w-7 bg-[#211D1A]" />

    </div>


    {/* Error */}
    {(localError || error) && (
      <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[9px] text-red-600">
        <FiAlertCircle className="h-3 w-3 shrink-0" />
        <span>{localError || error}</span>
      </div>
    )}


    {/* Success */}
    {successMessage && (
      <div className="mb-3 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-[9px] text-green-700">
        <FiCheck className="h-3 w-3 shrink-0" />
        <span>{successMessage}</span>
      </div>
    )}


    <form onSubmit={handleSubmit} className="space-y-2.5">


      {/* Full Name */}
      <div>
        <label
          htmlFor="fullname"
          className="mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-[#625B55]"
        >
          Full name
        </label>

        <input
          id="fullname"
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          placeholder="Rohan Mehra"
          required
          className="h-[34px] w-full rounded-[5px] border border-[#D8D1C8] bg-[#F8F6F2] px-3 text-[10px] text-[#211D1A] outline-none transition placeholder:text-[#AAA39B] focus:border-[#211D1A] focus:ring-1 focus:ring-[#211D1A]/10"
        />
      </div>


      {/* Contact */}
      <div>
        <label
          htmlFor="contact"
          className="mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-[#625B55]"
        >
          Contact number
        </label>

        <input
          id="contact"
          type="tel"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="+91 (98765) 43210"
          required
          className="h-[34px] w-full rounded-[5px] border border-[#D8D1C8] bg-[#F8F6F2] px-3 text-[10px] text-[#211D1A] outline-none transition placeholder:text-[#AAA39B] focus:border-[#211D1A] focus:ring-1 focus:ring-[#211D1A]/10"
        />
      </div>


      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-[#625B55]"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@123.com"
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
            type={showPassword ? 'text' : 'password'}
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
          >
            {showPassword ? (
              <FiEyeOff className="h-3 w-3" />
            ) : (
              <FiEye className="h-3 w-3" />
            )}
          </button>

        </div>
      </div>


      {/* Seller */}
      <label
        htmlFor="isSeller"
        className="flex cursor-pointer items-center gap-2 pt-0.5"
      >

        <input
          id="isSeller"
          type="checkbox"
          name="isSeller"
          checked={formData.isSeller}
          onChange={handleChange}
          className="sr-only"
        />

        <div
          className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[2px] border transition ${
            formData.isSeller
              ? 'border-[#211D1A] bg-[#211D1A] text-white'
              : 'border-[#CFC7BE] bg-[#F8F6F2]'
          }`}
        >
          {formData.isSeller && (
            <FiCheck className="h-2 w-2 stroke-[3]" />
          )}
        </div>

        <span className="text-[8px] font-medium text-[#746D66]">
          Register as a seller
        </span>

      </label>


      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="mt-0.5 flex h-[34px] w-full items-center justify-center rounded-[5px] bg-[#131212] px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-200 hover:bg-[#2B2927] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          'Create account'
        )}
      </button>


      {/* Divider */}
      <div className="flex items-center gap-2 py-0.5">

        <div className="h-px flex-1 bg-[#D8D1C8]" />

        <span className="text-[7px] uppercase tracking-[0.15em] text-[#AAA29A]">
          or
        </span>

        <div className="h-px flex-1 bg-[#D8D1C8]" />

      </div>


      {/* Google */}
      <div
        className="
          [&_button]:!h-[34px]
          [&_button]:!rounded-[5px]
          [&_button]:!border-[#D8D1C8]
          [&_button]:!bg-[#F8F6F2]
          [&_button]:!text-[9px]
          [&_button]:!text-[#4F4842]
          [&_button:hover]:!bg-[#F1ECE6]
          [&_button:hover]:!border-[#C9C0B7]
          
        "
      >
        <ContinueWithGoogle />
      </div>


      {/* Login */}
      <div className="pt-0.5 text-center">

        <span className="text-[10px] text-[#817A73]">
          Already have an account?
        </span>

        <Link
          to="/login"
          className="ml-1.5 text-[10px] font-bold text-[#211D1A] transition-colors duration-150 hover:text-[#211D1A]"
        >
          Sign in
        </Link>

      </div>

    </form>


    {/* Bottom */}
    <div className="mt-4 text-center">
      <span className="text-[6px] font-medium uppercase tracking-[0.25em] text-[#AAA29A]">
        Dress with intention
      </span>
    </div>

  </div>

</section>

      </div>
    </main>
  )
}

export default Register