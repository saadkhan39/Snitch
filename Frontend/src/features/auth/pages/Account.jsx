import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";
import useAuth from "../hooks/useAuth";

const Account = () => {
  const navigate = useNavigate();
  const { user, loading, handleLogout } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const initials = user?.fullname
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";

  const onLogout = async () => {
    setLogoutError("");
    const result = await handleLogout();

    if (result.success) {
      navigate("/");
    } else {
      setLogoutError(result.error);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F1EC] text-[#211D1A]">
      <header className="border-b border-[#DCD5CC] bg-[#F8F6F2]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="text-sm font-bold tracking-[0.16em]">
            SNITCH
          </Link>
          <Link
            to="/"
            className="group flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#625B55] transition hover:text-[#211D1A]"
          >
            <FiArrowLeft aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Continue shopping</span>
            <span className="sm:hidden">Shop</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#DCD5CC] pb-7 sm:pb-9">
          <div>
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-[#8A837C]">
              Account / Profile
            </p>
            <h1 className="mt-3 font-serif text-[2.25rem] leading-none sm:text-[3.25rem]">
              Your account
            </h1>
          </div>
          <p className="pb-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[#8A837C]">
            Personal details
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid min-h-64 animate-pulse border border-[#DCD5CC] bg-[#F8F6F2] sm:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-[#E7E1D9]" />
            <div className="space-y-5 p-6 sm:p-9">
              <div className="h-3 w-24 bg-[#E7E1D9]" />
              <div className="h-8 w-2/3 bg-[#E7E1D9]" />
              <div className="h-px w-full bg-[#E7E1D9]" />
              <div className="h-3 w-1/2 bg-[#E7E1D9]" />
              <div className="h-3 w-3/4 bg-[#E7E1D9]" />
            </div>
          </div>
        ) : user ? (
          <>
            <div className="mt-8 grid border border-[#DCD5CC] bg-[#F8F6F2] lg:grid-cols-[0.8fr_1.2fr]">
              <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-[#211D1A] p-6 text-white sm:p-9">
                <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full border border-white/10" />
                <div className="absolute -right-7 -top-7 h-34 w-34 rounded-full border border-white/10" />
                <p className="relative text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-white/60">
                  Member profile
                </p>
                <div className="relative mt-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 font-serif text-lg">
                    {initials}
                  </div>
                  <h2 className="max-w-sm wrap-break-word font-serif text-2xl leading-tight sm:text-3xl">
                    {user.fullname || "Snitch member"}
                  </h2>
                  <p className="mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-white/65">
                    {user.role || "Buyer"} account
                  </p>
                </div>
              </section>

              <section className="p-6 sm:p-9">
                <div className="mb-3 flex items-end justify-between gap-4 border-b border-[#DCD5CC] pb-4">
                  <h2 className="font-serif text-xl sm:text-2xl">Personal details</h2>
                  <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-[#8A837C]">
                    Profile information
                  </span>
                </div>
                <dl className="divide-y divide-[#E6E0D9]">
                  <div className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-5">
                    <dt className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[#8A837C]">
                      Full name
                    </dt>
                    <dd className="wrap-break-word text-sm font-medium">
                      {user.fullname || "Not provided"}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-5">
                    <dt className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[#8A837C]">
                      Email address
                    </dt>
                    <dd className="break-all text-sm font-medium">
                      {user.email || "Not provided"}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-5">
                    <dt className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[#8A837C]">
                      Contact number
                    </dt>
                    <dd className="wrap-break-word text-sm font-medium">
                      {user.contact || "Not provided"}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-5">
                    <dt className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[#8A837C]">
                      Account type
                    </dt>
                    <dd className="text-sm font-medium capitalize">
                      {user.role || "Buyer"}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>

            <div className="mt-5 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
              {logoutError ? (
                <p role="alert" className="text-sm text-red-700">
                  {logoutError}
                </p>
              ) : (
                <span className="text-xs text-[#8A837C]">
                  Your account details are linked to your Snitch profile.
                </span>
              )}
              <button
                type="button"
                onClick={onLogout}
                disabled={loading}
                className="inline-flex h-11 items-center gap-2 border border-[#BEB5AA] bg-transparent px-5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] transition hover:border-[#211D1A] hover:bg-[#211D1A] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiLogOut aria-hidden="true" />
                Log out
              </button>
            </div>
          </>
        ) : (
          <div className="mt-8 grid border-y border-[#DCD5CC] py-8 sm:mt-10 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-12 sm:py-12">
            <div className="max-w-xl">
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
                Welcome to Snitch
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
                Make this space yours.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#625B55]">
                Create an account or sign in to see your personal details.
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:mt-0 sm:min-w-48">
              <Link
                to="/register"
                className="inline-flex h-11 items-center justify-center bg-[#211D1A] px-5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#554D47]"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center border border-[#BEB5AA] px-5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] transition hover:border-[#211D1A] hover:bg-[#EEEAE5]"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Account;