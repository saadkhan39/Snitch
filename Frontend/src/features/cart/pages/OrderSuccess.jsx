import React from "react";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router";

const OrderSuccess = () => {
        const location = useLocation();
        const navigate = useNavigate();

        const queryParams = new URLSearchParams(location.search);
        const orderId = queryParams.get("order_id");

    return (
            <main className="min-h-screen bg-[#F8F6F2] text-[#211D1A]">
                <header className="h-[72px] border-b border-[#E1DBD4]">
                    <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold tracking-[0.16em]"
                        >
                            SNITCH
                        </button>
                        <span className="font-['Plus_Jakarta_Sans'] text-[8px] font-semibold uppercase tracking-[0.18em] text-[#8A837C]">
                            Order confirmation
                        </span>
                    </div>
                </header>

                <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[680px] flex-col items-center justify-center px-5 py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#BFC7B3] bg-[#E8ECE3] text-[#43523A]">
                        <FiCheck aria-hidden="true" className="h-6 w-6" />
                    </div>

                    <p className="mt-8 font-['Plus_Jakarta_Sans'] text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8A837C]">
                        Payment confirmed
                    </p>
                    <h1 className="mt-3 font-serif text-[42px] leading-tight sm:text-[52px]">
                        Your order is placed.
                    </h1>
                    <p className="mt-4 max-w-[420px] text-[12px] leading-6 text-[#716A64]">
                        Thank you for shopping with SNITCH. We’ve received your order and will get it ready for you.
                    </p>

                    {orderId && (
                        <div className="mt-8 w-full max-w-[420px] border-y border-[#E1DBD4] py-5 text-left">
                            <p className="font-['Plus_Jakarta_Sans'] text-[8px] font-semibold uppercase tracking-[0.16em] text-[#8A837C]">
                                Order reference
                            </p>
                            <p className="mt-2 break-all font-['Plus_Jakarta_Sans'] text-[12px] font-semibold">
                                {orderId}
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-8 inline-flex h-12 items-center justify-center gap-3 bg-[#211D1A] px-8 font-['Plus_Jakarta_Sans'] text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#4D4742]"
                    >
                        Continue shopping
                        <FiArrowRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                </section>
            </main>
        );
};

export default OrderSuccess;