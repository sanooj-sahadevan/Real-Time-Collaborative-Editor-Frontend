import React from "react";
import { Navigate } from "react-router-dom";

import Footer from "../components/common/Footer";
import ProfileItem from "../components/common/ProfileItem";
import { useAuth } from "../hooks/useAuth";
import { motion } from 'framer-motion';
import { Avatar, Chip } from '@mui/material';

const Profile: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 lg:py-14">

          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-[#e4ded4] bg-[#fffdf8] shadow-[0_16px_50px_rgba(49,42,31,0.08)]">
            <div className="flex flex-col gap-5 bg-[#202b2f] px-7 py-8 text-[#fffaf0] sm:flex-row sm:items-center sm:px-10"><Avatar sx={{ width: 68, height: 68, bgcolor: '#e08a18', color: '#202b2f', fontSize: 28 }}>{user.username.charAt(0).toUpperCase()}</Avatar><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f3bb5d]">Your profile</p><h1 className="mt-1 font-serif text-3xl font-semibold">{user.username}</h1><Chip label="Writer account" size="small" sx={{ mt: 1, color: '#d6dedc', borderColor: '#526065' }} variant="outlined" /></div></div>
            <div className="p-7 md:p-10"><h2 className="mb-3 font-serif text-2xl font-semibold text-[#20252b]">Personal information</h2><p className="mb-5 text-sm text-[#7b8385]">Your account details, kept simple.</p>

            <div className="flex flex-col">
              <ProfileItem
                label="Full Name"
                value={user.username}
              />

              <ProfileItem
                label="Email Address"
                value={user.email}
              />

              <ProfileItem
                label="Phone Number"
                value={user.phone}
              />

              <ProfileItem
                label="Age"
                value={user.age}
              />
            </div>
            </div></motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;