/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./views/Dashboard";
import { AuditLogsView } from "./views/AuditLogsView";
import { GradingSheet } from "./views/GradingSheet";
import { HODCertification } from "./views/HODCertification";
import { StudentJourney } from "./views/StudentJourney";
import { JourneyHistoryAudit } from "./views/JourneyHistoryAudit";
import { AdminManagement } from "./views/AdminManagement";
import { StaffRegistry } from "./views/StaffRegistry";
import { DepartmentManagement } from "./views/DepartmentManagement";
import { StudentRegistry } from "./views/StudentRegistry";
import { ParentRegistry } from "./views/ParentRegistry";
import { RevisionsFeed } from "./views/RevisionsFeed";
import { MissingObservations } from "./views/MissingObservations";
import { ArchiveView } from "./views/ArchiveView";
import { Timetable } from "./views/Timetable";
import { StudentTimetable } from "./views/StudentTimetable";
import { AcademicArchitect } from "./views/AcademicArchitect";
import { FinanceView } from "./views/FinanceView";
import { CommsView } from "./views/CommsView";
import { GradingRulesView } from "./views/GradingRulesView";
import { SchedulingView } from "./views/SchedulingView";
import { AcademicSetup } from "./views/AcademicSetup";
import { UIProvider, useUI } from "./context/UIContext";
import { useRole } from "./context/RoleContext";
import { SettingsView } from "./views/SettingsView";
import { SupportView } from "./views/SupportView";
import { StudentSettings } from "./views/StudentSettings";
import { StudentSupport } from "./views/StudentSupport";
import { HODSettings } from "./views/HODSettings";
import { HODSupport } from "./views/HODSupport";
import { MobileDrawer } from "./components/MobileDrawer";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { PerformanceAnalytics } from "./views/PerformanceAnalytics";
import { GraduationCap } from "lucide-react";
import { X } from "lucide-react";
import { RoleProvider } from "./context/RoleContext";

import { motion, AnimatePresence } from "framer-motion";

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-xl font-black text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { ExtendedLogsView } from "./views/ExtendedLogsView";
import { AdminSettings } from "./views/AdminSettings";
import { AdminSupport } from "./views/AdminSupport";
import Login from "./views/Login";

function AppContent() {
  const location = useLocation();
  const { user, isLoading } = useRole();
  const isDashboard = location.pathname === "/";
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    supportModalOpen,
    setSupportModalOpen,
  } = useUI();

  // Idle Auto-Logout Logic (15 minutes)
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(
        () => {
          // Session Purge Logic
          localStorage.clear();
          sessionStorage.clear();
          if (user) window.location.href = "/"; // Hard redirect to clear state
        },
        15 * 60 * 1000,
      ); // 15 minutes
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      if (timeout) clearTimeout(timeout);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#F9F9F7] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200"
        >
          <GraduationCap className="text-white" size={32} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-[#F9F9F7] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {location.pathname !== "/journey-audit" && <Topbar />}
        <main className="flex-1 flex overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/revisions" element={<RevisionsFeed />} />
            <Route
              path="/missing-observations"
              element={<MissingObservations />}
            />
            <Route
              path="/timetable"
              element={
                user?.role === "STUDENT" ? (
                  <StudentTimetable />
                ) : user?.role === "SUPER_ADMIN" ||
                  user?.role === "HEADMASTER" ? (
                  <SchedulingView />
                ) : (
                  <Timetable />
                )
              }
            />
            <Route path="/archive" element={<ArchiveView />} />
            <Route path="/grading" element={<GradingSheet />} />
            <Route path="/grading-rules" element={<GradingRulesView />} />
            // in your routes — accessible to TEACHER and HOD:
            <Route path="/analytics" element={<PerformanceAnalytics />} />
            <Route path="/finance" element={<FinanceView />} />
            <Route path="/comms" element={<CommsView />} />
            <Route path="/academic-architect" element={<AcademicArchitect />} />
            <Route
              path="/academic-setup"
              element={
                user?.role === "HOD" ||
                user?.role === "SUPER_ADMIN" ||
                user?.role === "HEADMASTER" ? (
                  <AcademicSetup />
                ) : (
                  <Dashboard />
                )
              }
            />
            <Route path="/audit" element={<AuditLogsView />} />
            <Route path="/audit/extended" element={<ExtendedLogsView />} />
            <Route path="/certification" element={<HODCertification />} />
            <Route path="/journey" element={<StudentJourney />} />
            <Route path="/journey-audit" element={<JourneyHistoryAudit />} />
            <Route path="/system" element={<AdminManagement />} />
            <Route path="/identity/staff" element={<StaffRegistry />} />
            <Route
              path="/identity/departments"
              element={<DepartmentManagement />}
            />
            <Route path="/identity/students" element={<StudentRegistry />} />
            <Route path="/identity/parents" element={<ParentRegistry />} />
            <Route
              path="/settings"
              element={
                user?.role === "STUDENT" ? (
                  <StudentSettings />
                ) : user?.role === "HOD" ? (
                  <HODSettings />
                ) : user?.role === "SUPER_ADMIN" ||
                  user?.role === "HEADMASTER" ? (
                  <AdminSettings />
                ) : (
                  <SettingsView />
                )
              }
            />
            <Route
              path="/support"
              element={
                user?.role === "STUDENT" ? (
                  <StudentSupport />
                ) : user?.role === "HOD" ? (
                  <HODSupport />
                ) : user?.role === "SUPER_ADMIN" ||
                  user?.role === "HEADMASTER" ? (
                  <AdminSupport />
                ) : (
                  <SupportView />
                )
              }
            />
          </Routes>
          {isDashboard &&
            user?.role !== "SUPER_ADMIN" &&
            user?.role !== "HEADMASTER" && (
              <div className="hidden xl:block"></div>
            )}
        </main>
      </div>

      <MobileDrawer />
      <MobileBottomNav />

      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Identity & Security Control"
      >
        {user?.role === "STUDENT" ? (
          <StudentSettings />
        ) : user?.role === "HOD" ? (
          <HODSettings />
        ) : user?.role === "SUPER_ADMIN" || user?.role === "HEADMASTER" ? (
          <AdminSettings />
        ) : (
          <SettingsView />
        )}
      </Modal>

      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title="ICT Support Desk"
      >
        {user?.role === "STUDENT" ? (
          <StudentSupport />
        ) : user?.role === "HOD" ? (
          <HODSupport />
        ) : user?.role === "SUPER_ADMIN" || user?.role === "HEADMASTER" ? (
          <AdminSupport />
        ) : (
          <SupportView />
        )}
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <RoleProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </RoleProvider>
    </Router>
  );
}
