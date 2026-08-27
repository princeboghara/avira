"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  PlayCircle,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  Lock,
  BookOpen,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Video,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";

interface CourseModule {
  id: string;
  title: string;
  category: "Binary Strategy" | "Sales Mastery" | "Leadership" | "Digital Growth";
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  icon: React.ComponentType<{ className?: string }>;
  isLocked?: boolean;
}

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const courses: CourseModule[] = [
    {
      id: "bin-101",
      title: "1:1 Binary Matching Blueprint",
      category: "Binary Strategy",
      level: "Beginner",
      description: "Master the foundational math behind 1:1 pair matching, daily capping, and cut-off cycles.",
      progress: 100,
      totalLessons: 4,
      completedLessons: 4,
      icon: TrendingUp,
    },
    {
      id: "bin-201",
      title: "Maximizing Daily Pair Capping",
      category: "Binary Strategy",
      level: "Intermediate",
      description: "Strategic placement tactics for balancing Left vs Right team volume to hit the ₹5,000/day cap.",
      progress: 60,
      totalLessons: 5,
      completedLessons: 3,
      icon: Sparkles,
    },
    {
      id: "sales-101",
      title: "Botanical Formulation & Product Pitch",
      category: "Sales Mastery",
      level: "Beginner",
      description: "How to explain cellular nutrition and organic bio-actives to health-conscious prospects.",
      progress: 80,
      totalLessons: 5,
      completedLessons: 4,
      icon: BookOpen,
    },
    {
      id: "sales-201",
      title: "Closing & Objection Handling",
      category: "Sales Mastery",
      level: "Intermediate",
      description: "Proven scripts to address network marketing questions and convert leads into 100 PV packages.",
      progress: 30,
      totalLessons: 6,
      completedLessons: 2,
      icon: CheckCircle2,
    },
    {
      id: "lead-101",
      title: "Building High-Performance Teams",
      category: "Leadership",
      level: "Advanced",
      description: "Developing downline leaders, running effective weekly zooms, and driving team duplication.",
      progress: 100,
      totalLessons: 4,
      completedLessons: 4,
      icon: Award,
    },
    {
      id: "dig-101",
      title: "Social Media Funnel & Lead Gen",
      category: "Digital Growth",
      level: "Intermediate",
      description: "Automate your associate onboarding with digital storytelling and compliant referral funnels.",
      progress: 0,
      totalLessons: 6,
      completedLessons: 0,
      icon: Users,
    },
  ];

  const filteredCourses = activeTab === "ALL" ? courses : courses.filter((c) => c.category === activeTab);

  return (
    <MemberLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* ========================================================
            1. HEADER BANNER
           ======================================================== */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#4f378a] via-[#372663] to-[#006d36] text-white shadow-xl shadow-[#4f378a]/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold mb-3">
              <GraduationCap className="w-4 h-4" />
              <span>Avira Global Training Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              Associate Academy & Strategy Hub
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Master the skills you need to build a high-volume binary organization. Learn directly from top earners, compensation experts, and wellness formulators.
            </p>
          </div>
        </div>

        {/* ========================================================
            2. FEATURED ONBOARDING MASTERCLASS
           ======================================================== */}
        <div className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm overflow-hidden group">
          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-gradient-to-tr from-[#1a1c1c] via-[#2d1b4e] to-[#006d36] flex items-center justify-center text-center p-6 shadow-inner">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-3xs" />
            <div className="relative z-10 flex flex-col items-center gap-4 max-w-lg">
              <span className="px-3 py-1 rounded-full bg-emerald-500/80 text-white text-xs font-bold uppercase tracking-wider">
                Featured Onboarding Masterclass
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                The 30-Day Momentum Blueprint: From 0 to Daily Capping
              </h2>
              <p className="text-xs text-gray-200">
                A step-by-step masterclass on structuring your 1:1 binary legs, driving 100 PV product activations, and achieving rank qualifications.
              </p>
              <button
                type="button"
                className="px-6 py-3 rounded-full bg-white text-[#006d36] font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-[#006d36]" />
                <span>Start Video Lesson (42 mins)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. COURSE CATEGORY TABS & GRID
           ======================================================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "Binary Strategy", "Sales Mastery", "Leadership", "Digital Growth"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === tab
                      ? "bg-[#006d36] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-[#5f5e5e] hover:text-[#1a1c1c] hover:bg-emerald-50/50"
                  }`}
                >
                  {tab === "ALL" ? "All Modules" : tab}
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold text-[#5f5e5e]">
              Showing <strong className="text-[#1a1c1c]">{filteredCourses.length}</strong> Training Modules
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const Icon = course.icon;
              const isCompleted = course.progress === 100;

              return (
                <div
                  key={course.id}
                  className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[#5f5e5e] text-[10px] font-bold">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1a1c1c] mb-1.5 group-hover:text-[#006d36] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#5f5e5e] leading-relaxed mb-6">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className={isCompleted ? "text-[#006d36]" : "text-[#5f5e5e]"}>
                        {isCompleted ? "Certified Completed" : `${course.progress}% Complete`}
                      </span>
                      <span className="text-[#5f5e5e]">
                        {course.completedLessons}/{course.totalLessons} Lessons
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-4">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-[#006d36]" : "bg-gradient-to-r from-[#006d36] to-[#50c878]"
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl border border-emerald-200 text-[#006d36] hover:bg-emerald-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{isCompleted ? "Review Masterclass" : "Continue Lesson"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
