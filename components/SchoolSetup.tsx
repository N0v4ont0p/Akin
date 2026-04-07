"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SchoolData,
  ClassData,
  getAllSchools,
  getClassesForSchool,
  createSchool,
  createClass,
} from "@/lib/firestore";

type Step = "school" | "class";

interface SchoolSetupProps {
  userId: string;
  onComplete: (classData: ClassData) => void;
}

export default function SchoolSetup({ userId, onComplete }: SchoolSetupProps) {
  const [step, setStep] = useState<Step>("school");
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);

  // Create school form
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolLocation, setNewSchoolLocation] = useState("");
  const [creatingSchool, setCreatingSchool] = useState(false);

  // Create class form
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllSchools()
      .then((data) => { if (active) setSchools(data); })
      .catch(() => { if (active) setError("Failed to load schools."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedSchool) return;
    let active = true;
    setLoading(true);
    getClassesForSchool(selectedSchool.schoolId)
      .then((data) => { if (active) setClasses(data); })
      .catch(() => { if (active) setError("Failed to load classes."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedSchool]);

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    s.location?.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(classSearch.toLowerCase())
  );

  const handleSelectSchool = (school: SchoolData) => {
    setSelectedSchool(school);
    setStep("class");
    setClassSearch("");
    setShowCreateClass(false);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) {
      setError("Please enter a school name.");
      return;
    }
    setCreatingSchool(true);
    setError("");
    try {
      const school = await createSchool(newSchoolName, newSchoolLocation, userId);
      setSchools((prev) => [school, ...prev]);
      handleSelectSchool(school);
      setNewSchoolName("");
      setNewSchoolLocation("");
      setShowCreateSchool(false);
    } catch {
      setError("Failed to create school. Please try again.");
    } finally {
      setCreatingSchool(false);
    }
  };

  const handleSelectClass = (classData: ClassData) => {
    onComplete(classData);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !selectedSchool) {
      setError("Please enter a class name.");
      return;
    }
    setCreatingClass(true);
    setError("");
    try {
      const classData = await createClass(
        newClassName,
        selectedSchool.schoolId,
        selectedSchool.name,
        userId
      );
      setClasses((prev) => [classData, ...prev]);
      handleSelectClass(classData);
    } catch {
      setError("Failed to create class. Please try again.");
    } finally {
      setCreatingClass(false);
    }
  };

  return (
    <div style={{ maxWidth: "520px", width: "100%", padding: "0 20px" }}>
      <AnimatePresence mode="wait">
        {step === "school" ? (
          <motion.div
            key="school-step"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--orchid)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
                Step 1 of 2
              </p>
              <h2 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                Find your school
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                Search for your school or create a new one.
              </p>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <svg
                width="16" height="16"
                viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                className="input-glass"
                type="text"
                placeholder="Search schools..."
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                style={{ paddingLeft: "42px" }}
                autoFocus
              />
            </div>

            {/* School list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", maxHeight: "280px", overflowY: "auto" }}>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: "68px", borderRadius: "14px" }} />
                ))
              ) : filteredSchools.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
                  No schools found
                </p>
              ) : (
                filteredSchools.map((school) => (
                  <motion.button
                    key={school.schoolId}
                    onClick={() => handleSelectSchool(school)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card"
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "inherit",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: "600", color: "#f0f0f5", marginBottom: "2px" }}>{school.name}</p>
                      {school.location && (
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{school.location}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {school.memberCount > 0 && (
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: "500" }}>
                          {school.memberCount} members
                        </span>
                      )}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Create school */}
            <AnimatePresence>
              {!showCreateSchool ? (
                <motion.button
                  onClick={() => setShowCreateSchool(true)}
                  className="btn-glass"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create your school
                </motion.button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateSchool}
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <input
                    className="input-glass"
                    type="text"
                    placeholder="School name"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    autoFocus
                  />
                  <input
                    className="input-glass"
                    type="text"
                    placeholder="Location (optional)"
                    value={newSchoolLocation}
                    onChange={(e) => setNewSchoolLocation(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn-glass"
                      onClick={() => setShowCreateSchool(false)}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      className="btn-orchid"
                      disabled={creatingSchool}
                      style={{ flex: 2, opacity: creatingSchool ? 0.7 : 1 }}
                    >
                      {creatingSchool ? "Creating..." : "Create School"}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <p style={{ color: "#ff4f7b", fontSize: "13px", marginTop: "12px", textAlign: "center" }}>{error}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="class-step"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Back + school badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <button
                onClick={() => { setStep("school"); setSelectedSchool(null); setError(""); }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>
              <div style={{
                background: "rgba(155,109,255,0.12)",
                border: "1px solid rgba(155,109,255,0.25)",
                borderRadius: "999px",
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--orchid)" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span style={{ fontSize: "13px", color: "var(--orchid)", fontWeight: "600" }}>
                  {selectedSchool?.name}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--orchid)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
                Step 2 of 2
              </p>
              <h2 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                Find your class
              </h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                Select your class or create a new one.
              </p>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <svg
                width="16" height="16"
                viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="input-glass"
                type="text"
                placeholder="Search classes..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                style={{ paddingLeft: "42px" }}
                autoFocus
              />
            </div>

            {/* Class list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", maxHeight: "260px", overflowY: "auto" }}>
              {loading ? (
                [1, 2].map((i) => (
                  <div key={i} className="skeleton" style={{ height: "60px", borderRadius: "14px" }} />
                ))
              ) : filteredClasses.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
                  No classes yet
                </p>
              ) : (
                filteredClasses.map((classData) => (
                  <motion.button
                    key={classData.classId}
                    onClick={() => handleSelectClass(classData)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card"
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "inherit",
                    }}
                  >
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#f0f0f5" }}>{classData.name}</p>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </motion.button>
                ))
              )}
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Create class */}
            <AnimatePresence>
              {!showCreateClass ? (
                <motion.button
                  onClick={() => setShowCreateClass(true)}
                  className="btn-glass"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create a class
                </motion.button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateClass}
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <input
                    className="input-glass"
                    type="text"
                    placeholder="Class name (e.g. Year 10 Maths)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    autoFocus
                    maxLength={50}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn-glass"
                      onClick={() => setShowCreateClass(false)}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      className="btn-orchid"
                      disabled={creatingClass}
                      style={{ flex: 2, opacity: creatingClass ? 0.7 : 1 }}
                    >
                      {creatingClass ? "Creating..." : "Create Class"}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <p style={{ color: "#ff4f7b", fontSize: "13px", marginTop: "12px", textAlign: "center" }}>{error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
