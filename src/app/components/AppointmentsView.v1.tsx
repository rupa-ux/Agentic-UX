import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import {
  Clock, User, Calendar, Users, X, Bell,
  MapPin, Phone, Mail,
  ChevronLeft, ChevronRight, ChevronDown,
  Search,
} from "lucide-react";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { cn } from "@/app/components/ui/utils";
import { FilterPaneTriggerButton } from "@/app/components/FilterPane.v1";
import { Button } from "@/app/components/ui/button";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Sheet, SheetContent,
} from "@/app/components/ui/sheet";
import {
  FloatingSheetFrame,
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
} from "@/app/components/layout/FloatingSheetFrame";
import { TooltipProvider } from "@/app/components/ui/tooltip";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";

/* ─── Types ─── */
type ApptStatus = "confirmed" | "requested" | "completed" | "cancelled" | "no_show" | "in_progress";
type CalendarView = "day" | "week" | "by-doctor";
type AppointmentStatusFilter = "all" | ApptStatus;

interface Provider {
  id: string; name: string; specialty: string; color: string; avatar: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  providerId: string;
  service: string;
  status: ApptStatus;
  date: string; // ISO yyyy-mm-dd
  startTime: string; // HH:MM 24h
  endTime: string;
  duration: number; // minutes
  location: string;
  notes?: string;
}

/* ─── Mock data ─── */
const PROVIDERS: Provider[] = [
  // sorted A → Z by last name
  { id: "p5",  name: "Dr. Ana Alvarado",   specialty: "Pediatric Dentistry",    color: "#dc2626", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "p1",  name: "Dr. Sarah Chen",     specialty: "General Dentistry",      color: "#4f46e5", avatar: "https://randomuser.me/api/portraits/women/25.jpg" },
  { id: "p7",  name: "Dr. Diana Cruz",     specialty: "Endodontics",            color: "#be185d", avatar: "https://randomuser.me/api/portraits/women/67.jpg" },
  { id: "p6",  name: "Dr. Ben Foster",     specialty: "Periodontics",           color: "#7c3aed", avatar: "https://randomuser.me/api/portraits/men/32.jpg"   },
  { id: "p9",  name: "Dr. Carlos Gutierrez", specialty: "Oral Medicine",        color: "#0369a1", avatar: "https://randomuser.me/api/portraits/men/55.jpg"   },
  { id: "p10", name: "Dr. Emily Harrison", specialty: "Dental Anesthesiology",  color: "#9333ea", avatar: "https://randomuser.me/api/portraits/women/33.jpg" },
  { id: "p3",  name: "Dr. Priya Nair",     specialty: "Cosmetic Dentistry",     color: "#059669", avatar: "https://randomuser.me/api/portraits/women/56.jpg" },
  { id: "p4",  name: "Dr. James Osei",     specialty: "Oral Surgery",           color: "#d97706", avatar: "https://randomuser.me/api/portraits/men/76.jpg"   },
  { id: "p8",  name: "Dr. Ethan Park",     specialty: "Prosthodontics",         color: "#0d9488", avatar: "https://randomuser.me/api/portraits/men/48.jpg"   },
  { id: "p11", name: "Dr. Kevin Patel",    specialty: "Implant Dentistry",      color: "#15803d", avatar: "https://randomuser.me/api/portraits/men/41.jpg"   },
  { id: "p12", name: "Dr. Yuki Tanaka",    specialty: "TMJ & Sleep Dentistry",  color: "#c2410c", avatar: "https://randomuser.me/api/portraits/women/79.jpg" },
  { id: "p2",  name: "Dr. Marcus Webb",    specialty: "Orthodontics",           color: "#0891b2", avatar: "https://randomuser.me/api/portraits/men/85.jpg"   },
];

const APPOINTMENTS: Appointment[] = [
  // ── April 14 (Mon) ──────────────────────────────────────────────────────────
  { id: "a1",  patientName: "Lisa Monroe",     patientEmail: "lisa@example.com",    patientPhone: "(512) 555-0141", providerId: "p1", service: "Teeth Cleaning",      status: "confirmed",   date: "2026-04-14", startTime: "09:00", endTime: "09:45", duration: 45, location: "Suite 101" },
  { id: "a2",  patientName: "Tom Harrington",  patientEmail: "tom@example.com",     patientPhone: "(512) 555-0182", providerId: "p2", service: "Braces Adjustment",   status: "confirmed",   date: "2026-04-14", startTime: "10:00", endTime: "10:30", duration: 30, location: "Suite 204" },
  { id: "a3",  patientName: "Aisha Rahman",    patientEmail: "aisha@example.com",   patientPhone: "(512) 555-0109", providerId: "p3", service: "Veneer Consultation", status: "requested",   date: "2026-04-14", startTime: "11:00", endTime: "11:30", duration: 30, location: "Suite 308" },
  { id: "a4",  patientName: "Carlos Vega",     patientEmail: "carlos@example.com",  patientPhone: "(512) 555-0155", providerId: "p4", service: "Tooth Extraction",    status: "confirmed",   date: "2026-04-14", startTime: "14:00", endTime: "15:00", duration: 60, location: "Suite 412" },
  // ── April 15 (Tue) ──────────────────────────────────────────────────────────
  { id: "a5",  patientName: "Fiona Blake",     patientEmail: "fiona@example.com",   patientPhone: "(512) 555-0122", providerId: "p1", service: "Root Canal",          status: "in_progress", date: "2026-04-15", startTime: "09:30", endTime: "11:00", duration: 90, location: "Suite 101" },
  { id: "a6",  patientName: "David Park",      patientEmail: "david@example.com",   patientPhone: "(512) 555-0177", providerId: "p2", service: "Retainer Fitting",    status: "confirmed",   date: "2026-04-15", startTime: "13:00", endTime: "13:30", duration: 30, location: "Suite 204" },
  // ── April 16 (Wed) ──────────────────────────────────────────────────────────
  { id: "a7",  patientName: "Maria Santos",    patientEmail: "maria@example.com",   patientPhone: "(512) 555-0133", providerId: "p3", service: "Whitening Session",   status: "confirmed",   date: "2026-04-16", startTime: "10:00", endTime: "11:00", duration: 60, location: "Suite 308" },
  { id: "a8",  patientName: "James Okafor",    patientEmail: "james@example.com",   patientPhone: "(512) 555-0194", providerId: "p1", service: "Check-up & X-ray",   status: "cancelled",   date: "2026-04-16", startTime: "14:30", endTime: "15:00", duration: 30, location: "Suite 101", notes: "Patient requested reschedule." },
  // ── April 17 (Thu) ──────────────────────────────────────────────────────────
  { id: "a9",  patientName: "Nina Petrov",     patientEmail: "nina@example.com",    patientPhone: "(512) 555-0161", providerId: "p4", service: "Implant Consult",     status: "confirmed",   date: "2026-04-17", startTime: "09:00", endTime: "09:30", duration: 30, location: "Suite 412" },
  { id: "a10", patientName: "Oliver Grant",    patientEmail: "oliver@example.com",  patientPhone: "(512) 555-0148", providerId: "p2", service: "Invisalign Check",    status: "requested",   date: "2026-04-17", startTime: "11:30", endTime: "12:00", duration: 30, location: "Suite 204" },
  { id: "a11", patientName: "Sophia Turner",   patientEmail: "sophia@example.com",  patientPhone: "(512) 555-0115", providerId: "p3", service: "Bonding",             status: "no_show",     date: "2026-04-17", startTime: "15:00", endTime: "15:45", duration: 45, location: "Suite 308" },
  // ── April 18 (Fri) ──────────────────────────────────────────────────────────
  { id: "a12", patientName: "Ben Nakamura",    patientEmail: "ben@example.com",     patientPhone: "(512) 555-0127", providerId: "p1", service: "Fluoride Treatment",  status: "confirmed",   date: "2026-04-18", startTime: "08:30", endTime: "09:00", duration: 30, location: "Suite 101" },
  { id: "a13", patientName: "Clara Hughes",    patientEmail: "clara@example.com",   patientPhone: "(512) 555-0188", providerId: "p3", service: "Scaling & Polish",    status: "completed",   date: "2026-04-18", startTime: "10:00", endTime: "10:45", duration: 45, location: "Suite 308" },
  { id: "a14", patientName: "Devon King",      patientEmail: "devon@example.com",   patientPhone: "(512) 555-0139", providerId: "p4", service: "Wisdom Tooth Eval",   status: "confirmed",   date: "2026-04-18", startTime: "13:30", endTime: "14:00", duration: 30, location: "Suite 412" },
  // ── April 19 (Sat) ──────────────────────────────────────────────────────────
  { id: "a15", patientName: "Elena Watts",     patientEmail: "elena@example.com",   patientPhone: "(512) 555-0172", providerId: "p2", service: "Dental Emergency",    status: "confirmed",   date: "2026-04-19", startTime: "10:00", endTime: "11:00", duration: 60, location: "Suite 204" },
  // ── April 7–10 (prior week — past) ─────────────────────────────────────────
  { id: "p1",  patientName: "Greta Lind",      patientEmail: "greta@example.com",   patientPhone: "(512) 555-0301", providerId: "p1", service: "Routine Exam",        status: "completed",   date: "2026-04-07", startTime: "09:00", endTime: "09:30", duration: 30, location: "Suite 101" },
  { id: "p2",  patientName: "Hugo Vance",      patientEmail: "hugo@example.com",    patientPhone: "(512) 555-0302", providerId: "p3", service: "Whitening Touch-up",  status: "completed",   date: "2026-04-08", startTime: "11:00", endTime: "11:45", duration: 45, location: "Suite 308" },
  { id: "p3",  patientName: "Ines Morales",    patientEmail: "ines@example.com",    patientPhone: "(512) 555-0303", providerId: "p2", service: "Wire Change",         status: "confirmed",   date: "2026-04-09", startTime: "14:00", endTime: "14:30", duration: 30, location: "Suite 204" },
  { id: "p4",  patientName: "Jared Pike",      patientEmail: "jared@example.com",   patientPhone: "(512) 555-0304", providerId: "p4", service: "Suture Removal",      status: "completed",   date: "2026-04-10", startTime: "10:30", endTime: "11:00", duration: 30, location: "Suite 412" },
  // ── April 21–26 (week after Easter week) ───────────────────────────────────
  { id: "p5",  patientName: "Kira Bloom",      patientEmail: "kira@example.com",    patientPhone: "(512) 555-0305", providerId: "p1", service: "Deep Cleaning",       status: "confirmed",   date: "2026-04-21", startTime: "08:30", endTime: "09:30", duration: 60, location: "Suite 101" },
  { id: "p6",  patientName: "Logan Pierce",    patientEmail: "logan@example.com",   patientPhone: "(512) 555-0306", providerId: "p5", service: "Pediatric Exam",      status: "confirmed",   date: "2026-04-22", startTime: "10:00", endTime: "10:30", duration: 30, location: "Suite 105" },
  { id: "p7",  patientName: "Mira Santos",     patientEmail: "mira@example.com",    patientPhone: "(512) 555-0307", providerId: "p7", service: "Root Canal Follow-up",status: "requested",   date: "2026-04-23", startTime: "13:00", endTime: "13:30", duration: 30, location: "Suite 315" },
  { id: "p8",  patientName: "Nico Brand",      patientEmail: "nico@example.com",    patientPhone: "(512) 555-0308", providerId: "p8", service: "Temp Crown Check",    status: "confirmed",   date: "2026-04-24", startTime: "09:00", endTime: "09:30", duration: 30, location: "Suite 420" },
  { id: "p9",  patientName: "Opal Trent",      patientEmail: "opal@example.com",    patientPhone: "(512) 555-0309", providerId: "p6", service: "Perio Charting",      status: "in_progress", date: "2026-04-25", startTime: "15:00", endTime: "15:45", duration: 45, location: "Suite 210" },
  // ── April 28–30 (bridge to May) ────────────────────────────────────────────
  { id: "p10", patientName: "Pia North",       patientEmail: "pia@example.com",     patientPhone: "(512) 555-0310", providerId: "p3", service: "Veneer Prep",         status: "confirmed",   date: "2026-04-28", startTime: "10:00", endTime: "11:00", duration: 60, location: "Suite 308" },
  { id: "p11", patientName: "Quinn Ellis",     patientEmail: "quinn@example.com",   patientPhone: "(512) 555-0311", providerId: "p1", service: "Filling",             status: "cancelled",   date: "2026-04-29", startTime: "11:30", endTime: "12:00", duration: 30, location: "Suite 101", notes: "Rescheduled to May." },
  { id: "p12", patientName: "Rosa Klein",      patientEmail: "rosa@example.com",    patientPhone: "(512) 555-0312", providerId: "p2", service: "Invisalign Attach",   status: "confirmed",   date: "2026-04-30", startTime: "14:00", endTime: "14:45", duration: 45, location: "Suite 204" },
  // ── May 1 (Today — by-doctor default view) ──────────────────────────────────
  // Dr. Sarah Chen (p1) — General Dentistry
  { id: "b1",  patientName: "Rachel Kim",      patientEmail: "rachel@example.com",  patientPhone: "(512) 555-0201", providerId: "p1", service: "Routine Check-up",    status: "confirmed",   date: "2026-05-01", startTime: "08:00", endTime: "08:45", duration: 45, location: "Suite 101" },
  { id: "b2",  patientName: "Marcus Lee",      patientEmail: "marcus@example.com",  patientPhone: "(512) 555-0202", providerId: "p1", service: "Teeth Cleaning",      status: "confirmed",   date: "2026-05-01", startTime: "09:00", endTime: "09:45", duration: 45, location: "Suite 101" },
  { id: "b3",  patientName: "Priya Kapoor",    patientEmail: "priya@example.com",   patientPhone: "(512) 555-0203", providerId: "p1", service: "Cavity Filling",      status: "in_progress", date: "2026-05-01", startTime: "10:00", endTime: "10:30", duration: 30, location: "Suite 101" },
  { id: "b4",  patientName: "Tom Walsh",       patientEmail: "tomw@example.com",    patientPhone: "(512) 555-0204", providerId: "p1", service: "Root Canal – Stage 1", status: "confirmed",  date: "2026-05-01", startTime: "11:00", endTime: "12:30", duration: 90, location: "Suite 101" },
  { id: "b5",  patientName: "Grace Nguyen",    patientEmail: "grace@example.com",   patientPhone: "(512) 555-0205", providerId: "p1", service: "Fluoride Treatment",  status: "requested",   date: "2026-05-01", startTime: "14:00", endTime: "14:30", duration: 30, location: "Suite 101" },
  { id: "b6",  patientName: "Eli Thompson",    patientEmail: "eli@example.com",     patientPhone: "(512) 555-0206", providerId: "p1", service: "Extraction Consult",  status: "confirmed",   date: "2026-05-01", startTime: "15:00", endTime: "15:30", duration: 30, location: "Suite 101" },
  // Dr. Marcus Webb (p2) — Orthodontics
  { id: "b7",  patientName: "Isabelle Roy",    patientEmail: "isabelle@example.com",patientPhone: "(512) 555-0207", providerId: "p2", service: "Braces Fitting",      status: "confirmed",   date: "2026-05-01", startTime: "08:30", endTime: "09:30", duration: 60, location: "Suite 204" },
  { id: "b8",  patientName: "Alex Chen",       patientEmail: "alexc@example.com",   patientPhone: "(512) 555-0208", providerId: "p2", service: "Invisalign Progress",  status: "confirmed",   date: "2026-05-01", startTime: "10:00", endTime: "10:30", duration: 30, location: "Suite 204" },
  { id: "b9",  patientName: "Maya Patel",      patientEmail: "maya@example.com",    patientPhone: "(512) 555-0209", providerId: "p2", service: "Retainer Adjustment",  status: "completed",   date: "2026-05-01", startTime: "11:00", endTime: "11:30", duration: 30, location: "Suite 204" },
  { id: "b10", patientName: "Liam Foster",     patientEmail: "liam@example.com",    patientPhone: "(512) 555-0210", providerId: "p2", service: "Braces Adjustment",   status: "confirmed",   date: "2026-05-01", startTime: "13:00", endTime: "13:30", duration: 30, location: "Suite 204" },
  { id: "b11", patientName: "Sara Moon",       patientEmail: "sara@example.com",    patientPhone: "(512) 555-0211", providerId: "p2", service: "Invisalign Scan",     status: "requested",   date: "2026-05-01", startTime: "14:30", endTime: "15:00", duration: 30, location: "Suite 204" },
  { id: "b12", patientName: "Jay Okonkwo",     patientEmail: "jay@example.com",     patientPhone: "(512) 555-0212", providerId: "p2", service: "Retainer Fitting",    status: "confirmed",   date: "2026-05-01", startTime: "15:30", endTime: "16:00", duration: 30, location: "Suite 204" },
  // Dr. Priya Nair (p3) — Cosmetic Dentistry
  { id: "b13", patientName: "Zoe Lambert",     patientEmail: "zoe@example.com",     patientPhone: "(512) 555-0213", providerId: "p3", service: "Veneer Consultation",  status: "confirmed",   date: "2026-05-01", startTime: "09:00", endTime: "09:45", duration: 45, location: "Suite 308" },
  { id: "b14", patientName: "Ryan Cho",        patientEmail: "ryan@example.com",    patientPhone: "(512) 555-0214", providerId: "p3", service: "Teeth Whitening",     status: "confirmed",   date: "2026-05-01", startTime: "10:00", endTime: "11:00", duration: 60, location: "Suite 308" },
  { id: "b15", patientName: "Nadia Flores",    patientEmail: "nadia@example.com",   patientPhone: "(512) 555-0215", providerId: "p3", service: "Composite Bonding",   status: "in_progress", date: "2026-05-01", startTime: "11:30", endTime: "12:15", duration: 45, location: "Suite 308" },
  { id: "b16", patientName: "Owen Harris",     patientEmail: "owen@example.com",    patientPhone: "(512) 555-0216", providerId: "p3", service: "Smile Design Consult", status: "requested",   date: "2026-05-01", startTime: "13:30", endTime: "14:00", duration: 30, location: "Suite 308" },
  { id: "b17", patientName: "Amy Reeves",      patientEmail: "amy@example.com",     patientPhone: "(512) 555-0217", providerId: "p3", service: "Scaling & Polish",    status: "confirmed",   date: "2026-05-01", startTime: "15:00", endTime: "15:45", duration: 45, location: "Suite 308" },
  // Dr. James Osei (p4) — Oral Surgery
  { id: "b18", patientName: "Victor Mensah",   patientEmail: "victor@example.com",  patientPhone: "(512) 555-0218", providerId: "p4", service: "Wisdom Tooth Removal", status: "confirmed",   date: "2026-05-01", startTime: "08:00", endTime: "09:00", duration: 60, location: "Suite 412" },
  { id: "b19", patientName: "Chloe Dubois",    patientEmail: "chloe@example.com",   patientPhone: "(512) 555-0219", providerId: "p4", service: "Implant Placement",   status: "confirmed",   date: "2026-05-01", startTime: "09:30", endTime: "11:00", duration: 90, location: "Suite 412" },
  { id: "b20", patientName: "Felix Torres",    patientEmail: "felix@example.com",   patientPhone: "(512) 555-0220", providerId: "p4", service: "Post-op Follow-up",   status: "completed",   date: "2026-05-01", startTime: "11:30", endTime: "12:00", duration: 30, location: "Suite 412" },
  { id: "b21", patientName: "Hannah Scott",    patientEmail: "hannah@example.com",  patientPhone: "(512) 555-0221", providerId: "p4", service: "Biopsy Consult",      status: "confirmed",   date: "2026-05-01", startTime: "13:00", endTime: "13:45", duration: 45, location: "Suite 412" },
  { id: "b22", patientName: "Leo Andrade",     patientEmail: "leo@example.com",     patientPhone: "(512) 555-0222", providerId: "p4", service: "Implant Consult",     status: "requested",   date: "2026-05-01", startTime: "14:30", endTime: "15:00", duration: 30, location: "Suite 412" },
  { id: "b23", patientName: "Iris Wade",       patientEmail: "iris@example.com",    patientPhone: "(512) 555-0223", providerId: "p4", service: "Extraction – Molar",  status: "confirmed",   date: "2026-05-01", startTime: "15:30", endTime: "16:30", duration: 60, location: "Suite 412" },
  // Dr. Ana Alvarado (p5) — Pediatric Dentistry
  { id: "b24", patientName: "Noah Kim",        patientEmail: "noah@example.com",    patientPhone: "(512) 555-0224", providerId: "p5", service: "Kids Check-up",       status: "confirmed",   date: "2026-05-01", startTime: "08:30", endTime: "09:00", duration: 30, location: "Suite 105" },
  { id: "b25", patientName: "Emma Tran",       patientEmail: "emmat@example.com",   patientPhone: "(512) 555-0225", providerId: "p5", service: "Sealants",            status: "confirmed",   date: "2026-05-01", startTime: "09:30", endTime: "10:00", duration: 30, location: "Suite 105" },
  { id: "b26", patientName: "Lucas Diaz",      patientEmail: "lucas@example.com",   patientPhone: "(512) 555-0226", providerId: "p5", service: "First Visit Consult",  status: "requested",   date: "2026-05-01", startTime: "10:30", endTime: "11:00", duration: 30, location: "Suite 105" },
  { id: "b27", patientName: "Mia Johansson",   patientEmail: "mia@example.com",     patientPhone: "(512) 555-0227", providerId: "p5", service: "Cavity Filling",      status: "confirmed",   date: "2026-05-01", startTime: "14:00", endTime: "14:30", duration: 30, location: "Suite 105" },
  { id: "b28", patientName: "Aiden Brooks",    patientEmail: "aiden@example.com",   patientPhone: "(512) 555-0228", providerId: "p5", service: "Fluoride Varnish",    status: "confirmed",   date: "2026-05-01", startTime: "15:00", endTime: "15:30", duration: 30, location: "Suite 105" },
  // Dr. Ben Foster (p6) — Periodontics
  { id: "b29", patientName: "Ava Brennan",     patientEmail: "avab@example.com",    patientPhone: "(512) 555-0229", providerId: "p6", service: "Deep Cleaning",       status: "confirmed",   date: "2026-05-01", startTime: "08:00", endTime: "09:00", duration: 60, location: "Suite 210" },
  { id: "b30", patientName: "Miles Obi",       patientEmail: "miles@example.com",   patientPhone: "(512) 555-0230", providerId: "p6", service: "Gum Evaluation",      status: "in_progress", date: "2026-05-01", startTime: "09:30", endTime: "10:00", duration: 30, location: "Suite 210" },
  { id: "b31", patientName: "Sophie Larsen",   patientEmail: "sophie@example.com",  patientPhone: "(512) 555-0231", providerId: "p6", service: "Perio Maintenance",   status: "confirmed",   date: "2026-05-01", startTime: "11:00", endTime: "11:30", duration: 30, location: "Suite 210" },
  { id: "b32", patientName: "Daniel Yuen",     patientEmail: "daniel@example.com",  patientPhone: "(512) 555-0232", providerId: "p6", service: "Crown Lengthening",   status: "requested",   date: "2026-05-01", startTime: "14:00", endTime: "15:00", duration: 60, location: "Suite 210" },
  { id: "b33", patientName: "Layla Hassan",    patientEmail: "layla@example.com",   patientPhone: "(512) 555-0233", providerId: "p6", service: "Scaling & Root Plan", status: "confirmed",   date: "2026-05-01", startTime: "15:30", endTime: "16:00", duration: 30, location: "Suite 210" },
  // Dr. Diana Cruz (p7) — Endodontics
  { id: "b34", patientName: "Ethan Moore",     patientEmail: "ethanm@example.com",  patientPhone: "(512) 555-0234", providerId: "p7", service: "Root Canal – Stage 1", status: "confirmed",  date: "2026-05-01", startTime: "08:00", endTime: "09:30", duration: 90, location: "Suite 315" },
  { id: "b35", patientName: "Clara Reid",      patientEmail: "clarareid@example.com",patientPhone: "(512) 555-0235", providerId: "p7", service: "Post & Core Follow-up",status: "completed",  date: "2026-05-01", startTime: "10:00", endTime: "10:30", duration: 30, location: "Suite 315" },
  { id: "b36", patientName: "Jack Navarro",    patientEmail: "jack@example.com",    patientPhone: "(512) 555-0236", providerId: "p7", service: "Root Canal – Stage 2", status: "confirmed",  date: "2026-05-01", startTime: "11:00", endTime: "12:00", duration: 60, location: "Suite 315" },
  { id: "b37", patientName: "Amara Okafor",    patientEmail: "amara@example.com",   patientPhone: "(512) 555-0237", providerId: "p7", service: "Cracked Tooth Consult",status: "requested",  date: "2026-05-01", startTime: "14:00", endTime: "14:30", duration: 30, location: "Suite 315" },
  { id: "b38", patientName: "Sam Whitfield",   patientEmail: "sam@example.com",     patientPhone: "(512) 555-0238", providerId: "p7", service: "Retreatment Eval",    status: "confirmed",   date: "2026-05-01", startTime: "15:00", endTime: "15:30", duration: 30, location: "Suite 315" },
  // Dr. Ethan Park (p8) — Prosthodontics
  { id: "b39", patientName: "Olivia Shaw",     patientEmail: "olivia@example.com",  patientPhone: "(512) 555-0239", providerId: "p8", service: "Crown Fitting",       status: "confirmed",   date: "2026-05-01", startTime: "09:00", endTime: "09:45", duration: 45, location: "Suite 420" },
  { id: "b40", patientName: "Ryan Mack",       patientEmail: "ryanm@example.com",   patientPhone: "(512) 555-0240", providerId: "p8", service: "Denture Adjustment",  status: "confirmed",   date: "2026-05-01", startTime: "10:30", endTime: "11:00", duration: 30, location: "Suite 420" },
  { id: "b41", patientName: "Zara Patel",      patientEmail: "zara@example.com",    patientPhone: "(512) 555-0241", providerId: "p8", service: "Bridge Consultation",  status: "requested",   date: "2026-05-01", startTime: "13:00", endTime: "13:45", duration: 45, location: "Suite 420" },
  { id: "b42", patientName: "Finn Gallagher",  patientEmail: "finn@example.com",    patientPhone: "(512) 555-0242", providerId: "p8", service: "Implant Crown",       status: "confirmed",   date: "2026-05-01", startTime: "14:30", endTime: "15:30", duration: 60, location: "Suite 420" },
  { id: "b43", patientName: "Leah Castillo",   patientEmail: "leah@example.com",    patientPhone: "(512) 555-0243", providerId: "p8",  service: "Full Denture Fit",          status: "confirmed",   date: "2026-05-01", startTime: "16:00", endTime: "17:00", duration: 60, location: "Suite 420" },
  // Dr. Carlos Gutierrez (p9) — Oral Medicine
  { id: "c1",  patientName: "Omar Vasquez",    patientEmail: "omar@example.com",    patientPhone: "(512) 555-0301", providerId: "p9",  service: "New Patient Oral Eval",     status: "confirmed",   date: "2026-05-01", startTime: "08:00", endTime: "09:00", duration: 60, location: "Suite 110", notes: "Interpreter needed — Spanish" },
  { id: "c2",  patientName: "Lisa Park",       patientEmail: "lisap@example.com",   patientPhone: "(512) 555-0302", providerId: "p9",  service: "Aphthous Ulcer Treatment",  status: "in_progress", date: "2026-05-01", startTime: "09:30", endTime: "10:00", duration: 30, location: "Suite 110" },
  { id: "c3",  patientName: "Danny Reyes",     patientEmail: "danny@example.com",   patientPhone: "(512) 555-0303", providerId: "p9",  service: "Burning Mouth Consult",     status: "confirmed",   date: "2026-05-01", startTime: "10:30", endTime: "11:30", duration: 60, location: "Suite 110" },
  { id: "c4",  patientName: "Mia Stern",       patientEmail: "mia2@example.com",    patientPhone: "(512) 555-0304", providerId: "p9",  service: "Oral Cancer Screening",     status: "requested",   date: "2026-05-01", startTime: "13:00", endTime: "13:30", duration: 30, location: "Suite 110" },
  { id: "c5",  patientName: "Paul Chang",      patientEmail: "paul@example.com",    patientPhone: "(512) 555-0305", providerId: "p9",  service: "Salivary Gland Disorder",   status: "confirmed",   date: "2026-05-01", startTime: "14:00", endTime: "14:45", duration: 45, location: "Suite 110" },
  // Dr. Emily Harrison (p10) — Dental Anesthesiology
  { id: "c6",  patientName: "Aria Collins",    patientEmail: "aria@example.com",    patientPhone: "(512) 555-0306", providerId: "p10", service: "IV Sedation Consult",       status: "confirmed",   date: "2026-05-01", startTime: "08:30", endTime: "09:00", duration: 30, location: "Suite 220", notes: "First-time sedation — anxious patient" },
  { id: "c7",  patientName: "Henry Burke",     patientEmail: "henry@example.com",   patientPhone: "(512) 555-0307", providerId: "p10", service: "Deep Sedation Procedure",   status: "confirmed",   date: "2026-05-01", startTime: "10:00", endTime: "11:30", duration: 90, location: "Suite 220", notes: "Pre-auth approved. NPO confirmed." },
  { id: "c8",  patientName: "Jenny Li",        patientEmail: "jenny@example.com",   patientPhone: "(512) 555-0308", providerId: "p10", service: "Nitrous Oxide Visit",       status: "completed",   date: "2026-05-01", startTime: "11:30", endTime: "12:00", duration: 30, location: "Suite 220" },
  { id: "c9",  patientName: "Tom Reynolds",    patientEmail: "tomr@example.com",    patientPhone: "(512) 555-0309", providerId: "p10", service: "Post-Sedation Check",       status: "confirmed",   date: "2026-05-01", startTime: "14:00", endTime: "14:30", duration: 30, location: "Suite 220" },
  { id: "c10", patientName: "Cora Banks",      patientEmail: "cora@example.com",    patientPhone: "(512) 555-0310", providerId: "p10", service: "Anxiety Assessment",        status: "requested",   date: "2026-05-01", startTime: "15:00", endTime: "15:45", duration: 45, location: "Suite 220" },
  // Dr. Kevin Patel (p11) — Implant Dentistry
  { id: "c11", patientName: "Andre Williams",  patientEmail: "andre@example.com",   patientPhone: "(512) 555-0311", providerId: "p11", service: "Implant Planning CT Scan",  status: "confirmed",   date: "2026-05-01", startTime: "08:00", endTime: "09:00", duration: 60, location: "Suite 318" },
  { id: "c12", patientName: "Susan Carter",    patientEmail: "susan@example.com",   patientPhone: "(512) 555-0312", providerId: "p11", service: "Bone Graft Follow-up",      status: "completed",   date: "2026-05-01", startTime: "09:30", endTime: "10:00", duration: 30, location: "Suite 318" },
  { id: "c13", patientName: "Mark Johnston",   patientEmail: "mark@example.com",    patientPhone: "(512) 555-0313", providerId: "p11", service: "Implant Placement",         status: "in_progress", date: "2026-05-01", startTime: "10:30", endTime: "12:00", duration: 90, location: "Suite 318", notes: "Requires wheelchair access" },
  { id: "c14", patientName: "Tina Lopez",      patientEmail: "tina@example.com",    patientPhone: "(512) 555-0314", providerId: "p11", service: "Implant Uncovering",        status: "confirmed",   date: "2026-05-01", startTime: "14:00", endTime: "14:30", duration: 30, location: "Suite 318" },
  { id: "c15", patientName: "Victor Chen",     patientEmail: "victorc@example.com", patientPhone: "(512) 555-0315", providerId: "p11", service: "Implant Crown Delivery",    status: "confirmed",   date: "2026-05-01", startTime: "15:00", endTime: "15:45", duration: 45, location: "Suite 318" },
  // Dr. Yuki Tanaka (p12) — TMJ & Sleep Dentistry
  { id: "c16", patientName: "Brianna Moore",   patientEmail: "brianna@example.com", patientPhone: "(512) 555-0316", providerId: "p12", service: "TMJ Evaluation",            status: "confirmed",   date: "2026-05-01", startTime: "08:30", endTime: "09:30", duration: 60, location: "Suite 425" },
  { id: "c17", patientName: "Carlos Espinoza", patientEmail: "carlose@example.com", patientPhone: "(512) 555-0317", providerId: "p12", service: "Sleep Apnea Device Fitting", status: "confirmed",  date: "2026-05-01", startTime: "10:00", endTime: "10:45", duration: 45, location: "Suite 425" },
  { id: "c18", patientName: "Rachel Green",    patientEmail: "rachelg@example.com", patientPhone: "(512) 555-0318", providerId: "p12", service: "Bruxism Guard Delivery",    status: "confirmed",   date: "2026-05-01", startTime: "11:30", endTime: "12:00", duration: 30, location: "Suite 425" },
  { id: "c19", patientName: "Kevin Moss",      patientEmail: "kevinm@example.com",  patientPhone: "(512) 555-0319", providerId: "p12", service: "TMJ Splint Follow-up",      status: "completed",   date: "2026-05-01", startTime: "13:30", endTime: "14:00", duration: 30, location: "Suite 425" },
  { id: "c20", patientName: "Amber Patel",     patientEmail: "amberp@example.com",  patientPhone: "(512) 555-0320", providerId: "p12", service: "Sleep Study Review",        status: "requested",   date: "2026-05-01", startTime: "15:00", endTime: "15:45", duration: 45, location: "Suite 425" },
  // ── May 4–8 (following week) ───────────────────────────────────────────────
  { id: "f1",  patientName: "Tara Singh",      patientEmail: "tara@example.com",    patientPhone: "(512) 555-0401", providerId: "p1", service: "New Patient Exam",    status: "confirmed",   date: "2026-05-04", startTime: "09:00", endTime: "10:00", duration: 60, location: "Suite 101" },
  { id: "f2",  patientName: "Uma Price",       patientEmail: "uma@example.com",     patientPhone: "(512) 555-0402", providerId: "p4", service: "Implant Review",      status: "requested",   date: "2026-05-05", startTime: "10:30", endTime: "11:00", duration: 30, location: "Suite 412" },
  { id: "f3",  patientName: "Vik Rao",         patientEmail: "vik@example.com",     patientPhone: "(512) 555-0403", providerId: "p2", service: "Braces Emergency",    status: "confirmed",   date: "2026-05-06", startTime: "08:00", endTime: "08:30", duration: 30, location: "Suite 204" },
  { id: "f4",  patientName: "Willa Hart",      patientEmail: "willa@example.com",   patientPhone: "(512) 555-0404", providerId: "p3", service: "Cosmetic Consult",    status: "confirmed",   date: "2026-05-07", startTime: "15:00", endTime: "15:30", duration: 30, location: "Suite 308" },
  { id: "f5",  patientName: "Xavier Cole",     patientEmail: "xavier@example.com",  patientPhone: "(512) 555-0405", providerId: "p5", service: "Fluoride",            status: "confirmed",   date: "2026-05-08", startTime: "11:00", endTime: "11:30", duration: 30, location: "Suite 105" },
  // ── May 11–15 & June (future) ───────────────────────────────────────────────
  { id: "f6",  patientName: "Yara Bloom",      patientEmail: "yara@example.com",    patientPhone: "(512) 555-0406", providerId: "p6", service: "Gum Graft Consult",   status: "requested",   date: "2026-05-12", startTime: "09:30", endTime: "10:30", duration: 60, location: "Suite 210" },
  { id: "f7",  patientName: "Zeke Murray",     patientEmail: "zeke@example.com",    patientPhone: "(512) 555-0407", providerId: "p7", service: "RCT Completion",      status: "confirmed",   date: "2026-05-14", startTime: "13:30", endTime: "14:30", duration: 60, location: "Suite 315" },
  { id: "f8",  patientName: "Ada Frost",       patientEmail: "ada@example.com",     patientPhone: "(512) 555-0408", providerId: "p8", service: "Denture Reline",      status: "confirmed",   date: "2026-06-02", startTime: "10:00", endTime: "11:00", duration: 60, location: "Suite 420" },
];

/* ─── Status config ─── */
const STATUS_CONFIG: Record<ApptStatus, { label: string; className: string; dotColor: string }> = {
  confirmed:   { label: "Confirmed",   className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dotColor: "#10b981" },
  requested:   { label: "Requested",   className: "bg-blue-50   text-blue-700   dark:bg-blue-950/40   dark:text-blue-400",   dotColor: "#3b82f6" },
  completed:   { label: "Completed",   className: "bg-slate-50  text-slate-600  dark:bg-slate-800/40  dark:text-slate-400",  dotColor: "#94a3b8" },
  cancelled:   { label: "Cancelled",   className: "bg-red-50    text-red-600    dark:bg-red-950/40    dark:text-red-400",    dotColor: "#ef4444" },
  no_show:     { label: "No show",     className: "bg-amber-50  text-amber-700  dark:bg-amber-950/40  dark:text-amber-400",  dotColor: "#f59e0b" },
  in_progress: { label: "In progress", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400", dotColor: "#8b5cf6" },
};
const STATUS_TEXT_CLASS: Record<ApptStatus, string> = {
  confirmed: "text-emerald-700 dark:text-emerald-400",
  requested: "text-blue-700 dark:text-blue-400",
  completed: "text-slate-600 dark:text-slate-400",
  cancelled: "text-red-600 dark:text-red-400",
  no_show: "text-amber-700 dark:text-amber-400",
  in_progress: "text-purple-700 dark:text-purple-400",
};

/* ─── Helpers ─── */
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDateHeader(iso: string): { day: string; num: number; month: string } {
  const d = parseDate(iso);
  return { day: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1], num: d.getDate(), month: MONTH_NAMES[d.getMonth()] };
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmtTime12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function providerById(id: string): Provider {
  return PROVIDERS.find((p) => p.id === id)!;
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Monday 00:00 local for the ISO week that contains `d`. */
function startOfWeekMonday(d: Date): Date {
  const x = startOfLocalDay(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function weekIsoDatesFromMonday(monday: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => dateToIso(addDays(monday, i)));
}

function isTodayIso(iso: string, todayIso: string): boolean {
  return iso === todayIso;
}

const APPOINTMENT_STATUS_FILTER_OPTIONS: { value: AppointmentStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "requested", label: "Requested" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No show" },
  { value: "in_progress", label: "In progress" },
];

/* ─── Shared calendar helpers ─── */
const TIME_SLOTS_24H: string[] = [];
for (let h = 0; h < 24; h++) {
  TIME_SLOTS_24H.push(`${h.toString().padStart(2, "0")}:00`);
  TIME_SLOTS_24H.push(`${h.toString().padStart(2, "0")}:30`);
}

function useCurrentTime(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Greedily distributes appointments into non-overlapping columns for side-by-side rendering. */
function buildCollisionColumns(appts: Appointment[]): Appointment[][] {
  const cols: { appts: Appointment[]; lastEndMin: number }[] = [];
  for (const a of appts) {
    const startMin = timeToMinutes(a.startTime);
    const endMin = startMin + a.duration;
    let placed = false;
    for (const col of cols) {
      if (startMin >= col.lastEndMin) {
        col.appts.push(a);
        col.lastEndMin = endMin;
        placed = true;
        break;
      }
    }
    if (!placed) cols.push({ appts: [a], lastEndMin: endMin });
  }
  return cols.map((c) => c.appts);
}

/* ─── Appointment card (calendar cell) ─── */
export function ApptCard({
  appt,
  onClick,
  compact = false,
  hideDoctor = false,
}: {
  appt: Appointment;
  onClick: (a: Appointment) => void;
  compact?: boolean;
  hideDoctor?: boolean;
}) {
  const provider = providerById(appt.providerId);

  return (
    <button
      onClick={() => onClick(appt)}
      className="w-full text-left rounded-lg border border-border overflow-hidden transition-colors cursor-pointer group"
    >
      <div className="px-2.5 py-2 bg-card group-hover:bg-muted transition-colors">
        <p className={`font-semibold text-foreground leading-tight ${compact ? "text-[11px]" : "text-xs"}`}>
          {appt.patientName}
        </p>
        {!hideDoctor && (
          <p className="text-[10px] font-medium mt-0.5 leading-tight" style={{ color: provider.color }}>
            {provider.name}
          </p>
        )}
        {!compact && (
          <>
            <p className="text-[10px] text-muted-foreground mt-0.5">{appt.service}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock size={9} strokeWidth={1.6} absoluteStrokeWidth />
              {fmtTime12(appt.startTime)} · {appt.duration}m
            </p>
          </>
        )}
        {compact && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{fmtTime12(appt.startTime)}</p>
        )}
      </div>
    </button>
  );
}

/* ─── Calendar week view ─── */
function WeekCalendar({
  dates,
  appointments,
  onApptClick,
  todayIso,
}: {
  dates: string[];
  appointments: Appointment[];
  onApptClick: (a: Appointment) => void;
  /** yyyy-mm-dd — real today or Storybook `mockTodayIso`. */
  todayIso: string;
}) {
  const now = useCurrentTime();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const byDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const d of dates) map[d] = [];
    for (const a of appointments) {
      if (map[a.date]) map[a.date].push(a);
    }
    for (const d of dates) {
      map[d].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    }
    return map;
  }, [dates, appointments]);

  const TIME_SLOTS = TIME_SLOTS_24H;
  const nowTopPx40 = (currentMinutes / 30) * 40;
  const weekScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    weekScrollRef.current?.scrollTo({ top: Math.max(0, nowTopPx40 - 80) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Gutter + time column */}
      <div className="flex flex-col shrink-0 pl-4">
        {/* Header spacer */}
        <div className="h-10 border-b border-r border-border" style={{ width: 52 }} />
        {/* Time labels */}
        <div className="overflow-y-auto flex-1 border-r border-border" style={{ width: 52 }}>
          {TIME_SLOTS.map((t) => (
            <div
              key={t}
              className="flex items-start justify-end pr-2 text-[10px] text-muted-foreground"
              style={{ height: 40 }}
            >
              <span className="-translate-y-1.5">{t.endsWith(":00") ? fmtTime12(t) : ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day columns (scrollable together) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex flex-col min-w-0">
        {/* Day headers */}
        <div className="flex border-b border-border shrink-0">
          {dates.map((d) => {
            const { day, num } = fmtDateHeader(d);
            const today = isTodayIso(d, todayIso);
            return (
              <div
                key={d}
                className={`flex-1 min-w-[120px] h-10 flex items-center justify-center gap-2 border-r border-border last:border-r-0 ${today ? "bg-primary/5" : ""}`}
              >
                <span className="text-[11px] text-muted-foreground font-medium">{day}</span>
                <span
                  className={`text-sm font-semibold ${today ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs" : "text-foreground"}`}
                >
                  {num}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div ref={weekScrollRef} className="flex flex-1 overflow-y-auto">
          {dates.map((d) => {
            const isToday = isTodayIso(d, todayIso);
            const isPastDate = d < todayIso;
            const dayAppts = byDate[d] ?? [];
            const allGroups = buildCollisionColumns(dayAppts);
            const MAX_WEEK_COLS = 2;
            const colGroups = allGroups.slice(0, MAX_WEEK_COLS);
            const hiddenCount = allGroups.slice(MAX_WEEK_COLS).flat().length;
            const numCols = Math.max(colGroups.length, 1);
            return (
              <div
                key={d}
                className={`flex-1 min-w-[120px] border-r border-border last:border-r-0 relative ${isToday ? "bg-primary/[0.02]" : ""}`}
              >
                {/* Grid rows with past dimming */}
                {TIME_SLOTS.map((t) => {
                  const slotMin = timeToMinutes(t);
                  const past = isPastDate || (isToday && slotMin < currentMinutes);
                  return (
                    <div
                      key={t}
                      className={cn(
                        `border-b ${t.endsWith(":30") ? "border-dashed border-border/40" : "border-border/60"}`,
                        past && "bg-muted/25",
                      )}
                      style={{ height: 40 }}
                    />
                  );
                })}

                {/* Appointments — collision columns (capped at MAX_WEEK_COLS) */}
                <div className="absolute inset-0 pointer-events-none">
                  {colGroups.flatMap((colAppts, colIdx) =>
                    colAppts.map((a) => {
                      const topPx = (timeToMinutes(a.startTime) / 30) * 40;
                      const heightPx = Math.max((a.duration / 30) * 40 - 4, 36);
                      const leftPct = (colIdx / numCols) * 100;
                      const widthPct = (1 / numCols) * 100;
                      const pastAppt = isPastDate || (isToday && timeToMinutes(a.endTime) < currentMinutes);
                      return (
                        <div
                          key={a.id}
                          className={cn("absolute pointer-events-auto", pastAppt && "opacity-60")}
                          style={{ top: topPx + 2, height: heightPx, left: `${leftPct}%`, width: `${widthPct}%`, padding: "0 2px" }}
                        >
                          <ApptCard appt={a} onClick={onApptClick} compact={a.duration <= 30} />
                        </div>
                      );
                    })
                  )}
                  {hiddenCount > 0 && (
                    <div className="absolute bottom-2 left-1 right-1 pointer-events-auto">
                      <div className="rounded-md bg-muted/80 px-2 py-0.5 text-center text-[10px] text-muted-foreground">
                        +{hiddenCount} more
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Day schedule list view ─── */
function DayCalendar({
  date,
  appointments,
  onApptClick,
  todayIso,
}: {
  date: string;
  appointments: Appointment[];
  onApptClick: (a: Appointment) => void;
  todayIso: string;
}) {
  const now = useCurrentTime();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = isTodayIso(date, todayIso);
  const isPastDate = date < todayIso;

  // Sort and group appointments by start time
  const timeGroups = useMemo(() => {
    const sorted = appointments
      .filter((a) => a.date === date)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const groups: { time: string; appts: Appointment[] }[] = [];
    for (const a of sorted) {
      const last = groups[groups.length - 1];
      if (last && last.time === a.startTime) {
        last.appts.push(a);
      } else {
        groups.push({ time: a.startTime, appts: [a] });
      }
    }
    return groups;
  }, [date, appointments]);

  const dayScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to first future group on today
  useEffect(() => {
    if (!isToday || !dayScrollRef.current) return;
    const el = dayScrollRef.current.querySelector<HTMLElement>("[data-future]");
    if (el) el.scrollIntoView({ block: "start" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (timeGroups.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No appointments
      </div>
    );
  }

  return (
    <div ref={dayScrollRef} className="flex-1 min-h-0 overflow-y-auto">
      <div className="py-3 px-4 flex flex-col gap-1">
        {timeGroups.map(({ time, appts }) => {
          const isPast = isPastDate || (isToday && timeToMinutes(time) < currentMinutes);
          const isFuture = isToday && timeToMinutes(time) >= currentMinutes;
          return (
            <div
              key={time}
              data-future={isFuture ? "" : undefined}
              className={cn("flex gap-4 py-2 border-b border-border/40 last:border-b-0", isPast && "opacity-60")}
            >
              {/* Time label */}
              <div className="w-16 shrink-0 pt-1 text-right">
                <span className="text-[11px] text-muted-foreground tabular-nums">{fmtTime12(time)}</span>
              </div>
              {/* Appointment cards — side by side if same start time */}
              <div className="flex flex-1 flex-wrap gap-2">
                {appts.map((a) => {
                  const provider = providerById(a.providerId);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onApptClick(a)}
                      className="flex flex-col gap-0.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left min-w-[180px] flex-1 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <p className="text-[13px] font-semibold text-foreground">{a.patientName}</p>
                      <p className="text-[12px] text-muted-foreground">{a.service}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={9} strokeWidth={1.6} absoluteStrokeWidth />
                        {fmtTime12(a.startTime)} – {fmtTime12(a.endTime)}
                      </p>
                      <p className="text-[11px] font-medium mt-0.5" style={{ color: provider.color }}>{provider.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const COL_W = 160; // px per doctor column


/* ─── By-doctor single-day view ─── */
export function ByDoctorCalendar({
  date,
  appointments,
  onApptClick,
  todayIso,
}: {
  date: string;
  appointments: Appointment[];
  onApptClick: (a: Appointment) => void;
  todayIso: string;
}) {
  const now = useCurrentTime();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = isTodayIso(date, todayIso);
  const isPastDate = date < todayIso;
  const nowTopPx = (currentMinutes / 30) * 40;

  const byProvider = useMemo(() => {
    const dayAppts = appointments.filter((a) => a.date === date);
    const map: Record<string, Appointment[]> = {};
    for (const p of PROVIDERS) map[p.id] = [];
    for (const a of dayAppts) if (map[a.providerId]) map[a.providerId].push(a);
    for (const id in map) map[id].sort((x, y) => timeToMinutes(x.startTime) - timeToMinutes(y.startTime));
    return map;
  }, [date, appointments]);

  const TIME_SLOTS = TIME_SLOTS_24H;

  // Sync vertical scroll: gutter follows the single grid scroll container
  const gutterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const handleGridScroll = useCallback(() => {
    if (gutterRef.current && gridRef.current) {
      gutterRef.current.scrollTop = gridRef.current.scrollTop;
    }
  }, []);
  useEffect(() => {
    const top = Math.max(0, nowTopPx - 80);
    gridRef.current?.scrollTo({ top });
    if (gutterRef.current) gutterRef.current.scrollTop = top;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const HEADER_H = 80; // px — taller to fit avatar + name + specialty

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* ── Sticky time gutter (left) ── */}
      <div className="flex flex-col shrink-0 pl-4">
        {/* corner spacer — matches header height */}
        <div className="shrink-0 border-b border-r border-border" style={{ width: 52, height: HEADER_H }} />
        {/* time labels — overflow hidden, scrollTop driven by grid */}
        <div ref={gutterRef} className="flex-1 overflow-hidden border-r border-border" style={{ width: 52 }}>
          {TIME_SLOTS.map((t) => (
            <div
              key={t}
              className="flex items-start justify-end pr-2 text-[10px] text-muted-foreground"
              style={{ height: 40 }}
            >
              <span className="-translate-y-1.5">{t.endsWith(":00") ? fmtTime12(t) : ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Single scroll container (handles both X and Y) ── */}
      <div
        ref={gridRef}
        className="flex-1 min-w-0 overflow-auto"
        onScroll={handleGridScroll}
      >
        {/* Sticky header row — sticks to top, scrolls with X */}
        <div
          className="sticky top-0 z-10 flex bg-card border-b border-border"
          style={{ minWidth: PROVIDERS.length * COL_W }}
        >
          {PROVIDERS.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center justify-center gap-1.5 px-3"
              style={{ width: COL_W, minWidth: COL_W, height: HEADER_H }}
            >
              {/* Avatar: doctor photo */}
              <div
                className="rounded-full overflow-hidden shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  boxShadow: `0 0 0 2px ${p.color}66`,
                }}
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="text-center min-w-0 w-full">
                <p className="text-[11px] font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{p.specialty}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Time grid columns */}
        <div
          className="flex relative"
          style={{ minWidth: PROVIDERS.length * COL_W }}
        >
          {PROVIDERS.map((p) => {
            const rawAppts = byProvider[p.id] ?? [];
            const colGroups = buildCollisionColumns(rawAppts);
            const numCols = Math.max(colGroups.length, 1);
            return (
              <div
                key={p.id}
                className="relative"
                style={{ width: COL_W, minWidth: COL_W }}
              >
                {/* Slot rows with past dimming */}
                {TIME_SLOTS.map((t) => {
                  const slotMin = timeToMinutes(t);
                  const past = isPastDate || (isToday && slotMin < currentMinutes);
                  return (
                    <div
                      key={t}
                      className={cn(
                        `border-b ${t.endsWith(":30") ? "border-dashed border-border/40" : "border-border/60"}`,
                        past && "bg-muted/25",
                      )}
                      style={{ height: 40 }}
                    />
                  );
                })}

                {/* Appointments — collision columns */}
                <div className="absolute inset-0 pointer-events-none">
                  {colGroups.flatMap((colAppts, colIdx) =>
                    colAppts.map((a) => {
                      const topPx = (timeToMinutes(a.startTime) / 30) * 40;
                      const heightPx = Math.max((a.duration / 30) * 40 - 4, 36);
                      const leftPct = (colIdx / numCols) * 100;
                      const widthPct = (1 / numCols) * 100;
                      const pastAppt = isPastDate || (isToday && timeToMinutes(a.endTime) < currentMinutes);
                      return (
                        <div
                          key={a.id}
                          className={cn("absolute pointer-events-auto", pastAppt && "opacity-60")}
                          style={{ top: topPx + 2, height: heightPx, left: `${leftPct}%`, width: `${widthPct}%`, padding: "0 2px" }}
                        >
                          <ApptCard appt={a} onClick={onApptClick} compact hideDoctor />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Appointment detail Sheet ─── */
function ApptDetailSheet({
  open,
  appt,
  onClose,
}: {
  open: boolean;
  appt: Appointment | null;
  onClose: () => void;
}) {
  if (!appt) return null;
  const provider = providerById(appt.providerId);
  const statusCfg = STATUS_CONFIG[appt.status];
  const statusTextClass = STATUS_TEXT_CLASS[appt.status];
  const { num, month } = fmtDateHeader(appt.date);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="md"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title="Appointment detail"
          description={`Appointment for ${appt.patientName}`}
          classNames={{
            body: "px-0 py-0",
            footer: "justify-start",
          }}
          footer={(
            <div className="flex w-full flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="h-9 rounded-md px-3.5 text-[13px] shadow-sm cursor-pointer gap-2"
              >
                <Bell size={12} strokeWidth={1.6} absoluteStrokeWidth />
                Send reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-md px-3 text-[13px] cursor-pointer gap-2"
              >
                <Calendar size={12} strokeWidth={1.6} absoluteStrokeWidth />
                Reschedule
              </Button>
              {(appt.status === "confirmed" || appt.status === "requested") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-md px-3 text-[13px] text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer gap-2"
                >
                  <X size={12} strokeWidth={1.6} absoluteStrokeWidth />
                  Cancel
                </Button>
              )}
            </div>
          )}
        >
          <div className="flex flex-col gap-6 px-6 py-4">
            {/* Status banner */}
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ background: `${provider.color}14`, borderLeft: `3px solid ${provider.color}` }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{appt.service}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{provider.name}</p>
              </div>
              <span className={`shrink-0 text-sm font-medium ${statusTextClass}`}>
                {statusCfg.label}
              </span>
            </div>

            {/* Patient info */}
            <section className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground">Patient</p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User size={14} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-muted-foreground" />
                  <span className="font-medium text-foreground">{appt.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{appt.patientPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{appt.patientEmail}</span>
                </div>
              </div>
            </section>

            {/* Appointment info */}
            <section className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground">Details</p>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { icon: Calendar, label: "Date", value: `${DAY_FULL[parseDate(appt.date).getDay() === 0 ? 6 : parseDate(appt.date).getDay() - 1]}, ${month} ${num}` },
                  { icon: Clock, label: "Time", value: `${fmtTime12(appt.startTime)} – ${fmtTime12(appt.endTime)} (${appt.duration} min)` },
                  { icon: MapPin, label: "Location", value: appt.location },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <Icon size={14} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Notes */}
            {appt.notes && (
              <section className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground">{appt.notes}</p>
              </section>
            )}
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

export type AppointmentsViewProps = {
  defaultCalendarView?: CalendarView;
  /** Initial anchor day (yyyy-mm-dd). Default `2026-05-01` matches dense mock day. */
  initialAnchorDateIso?: string;
  /**
   * Pin “today” for highlights + **Today** button (Storybook / tests). In the live app, omit to use the real clock.
   */
  mockTodayIso?: string;
};

/* ─── Main view ─── */
export function AppointmentsView({
  defaultCalendarView,
  initialAnchorDateIso,
  mockTodayIso,
}: AppointmentsViewProps = {}) {
  const [calendarView, setCalendarView] = useState<CalendarView>(defaultCalendarView ?? "by-doctor");
  const [anchorDate, setAnchorDate] = useState(() =>
    startOfLocalDay(parseDate(initialAnchorDateIso ?? "2026-05-01")),
  );
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>("all");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleApptClick = (a: Appointment) => {
    setSelectedAppt(a);
    setSheetOpen(true);
  };

  const weekMonday = useMemo(() => startOfWeekMonday(anchorDate), [anchorDate]);
  const weekDates = useMemo(() => weekIsoDatesFromMonday(weekMonday), [weekMonday]);
  const anchorIso = useMemo(() => dateToIso(startOfLocalDay(anchorDate)), [anchorDate]);

  const visibleAppointments = useMemo(() => {
    let list =
      statusFilter === "all"
        ? APPOINTMENTS
        : APPOINTMENTS.filter((a) => a.status === statusFilter);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => {
      const provider = providerById(a.providerId);
      return (
        a.patientName.toLowerCase().includes(q) ||
        a.service.toLowerCase().includes(q) ||
        provider.name.toLowerCase().includes(q)
      );
    });
  }, [statusFilter, searchQuery]);

  const weekRangeLabel = useMemo(() => {
    const start = parseDate(weekDates[0]);
    const end = parseDate(weekDates[6]);
    return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${start.getMonth() !== end.getMonth() ? `${MONTH_NAMES[end.getMonth()]} ` : ""}${end.getDate()}, ${end.getFullYear()}`;
  }, [weekDates]);

  const dayNavLabel = useMemo(() => {
    const d = startOfLocalDay(anchorDate);
    const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return `${DAY_FULL[idx]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }, [anchorDate]);

  const goPrev = () => {
    if (calendarView === "week") setAnchorDate(addDays(weekMonday, -7));
    else setAnchorDate(addDays(anchorDate, -1));
  };

  const goNext = () => {
    if (calendarView === "week") setAnchorDate(addDays(weekMonday, 7));
    else setAnchorDate(addDays(anchorDate, 1));
  };

  const liveTodayIso = dateToIso(startOfLocalDay(new Date()));
  const todayIso = mockTodayIso ?? liveTodayIso;

  const goToday = () => {
    setAnchorDate(startOfLocalDay(mockTodayIso != null ? parseDate(mockTodayIso) : new Date()));
  };

  const isAnchorToday = anchorIso === todayIso;

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <MainCanvasViewHeader
          titleClassName="font-normal"
          title={
            <>
              <span className="sr-only">Appointments · </span>
              <span className="flex min-w-0 flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 font-normal text-muted-foreground hover:text-foreground"
                  onClick={goPrev}
                  aria-label={calendarView === "week" ? "Previous week" : "Previous day"}
                >
                  <ChevronLeft className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
                <span
                  className="min-w-0 max-w-[min(100%,18rem)] shrink truncate px-1 text-center text-base font-medium text-foreground tabular-nums sm:max-w-[24rem]"
                  aria-live="polite"
                >
                  {calendarView === "week" ? weekRangeLabel : dayNavLabel}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 font-normal text-muted-foreground hover:text-foreground"
                  onClick={goNext}
                  aria-label={calendarView === "week" ? "Next week" : "Next day"}
                >
                  <ChevronRight className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goToday}
                  disabled={isAnchorToday}
                  className="ml-1 shrink-0 px-2 text-lg font-medium text-primary hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
                >
                  Today
                </Button>
              </span>
            </>
          }
          actions={
            <>
              {searchOpen ? (
                <div className="relative h-[var(--button-height)] w-[min(100%,240px)] min-w-[200px] shrink">
                  <Search
                    className="pointer-events-none absolute left-2 top-1/2 size-[14px] -translate-y-1/2 text-[#303030] dark:text-muted-foreground"
                    strokeWidth={L1_STRIP_ICON_STROKE_PX}
                    absoluteStrokeWidth
                    aria-hidden
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (searchQuery === "") setSearchOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }
                    }}
                    autoFocus
                    placeholder="Doctor, patient, or service"
                    className="h-full w-full rounded-[8px] border border-[#e5e9f0] bg-white py-0 pr-2 pl-8 text-[14px] text-[#212121] outline-none transition-colors placeholder:text-[#757575] focus:border-[#2552ED] focus:ring-1 focus:ring-[#2552ED] dark:border-border dark:bg-muted dark:text-foreground dark:placeholder:text-[#8b92a5]"
                    aria-label="Search appointments by doctor, patient, or service"
                  />
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Open search"
                  aria-expanded={false}
                  title="Search appointments"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search
                    className="size-[14px] text-[#303030] dark:text-muted-foreground"
                    strokeWidth={L1_STRIP_ICON_STROKE_PX}
                    absoluteStrokeWidth
                    aria-hidden
                  />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-[8.5rem] justify-between gap-2 font-normal"
                    aria-label="Status"
                  >
                    <span className="truncate">
                      {APPOINTMENT_STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All"}
                    </span>
                    <ChevronDown
                      className="size-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[8.5rem]">
                  {APPOINTMENT_STATUS_FILTER_OPTIONS.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      className={cn(
                        "font-normal",
                        o.value === statusFilter && "bg-primary/10 text-primary",
                      )}
                      onSelect={() => setStatusFilter(o.value)}
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <SegmentedToggle<CalendarView>
                iconOnly
                ariaLabel="Calendar range"
                value={calendarView}
                onChange={setCalendarView}
                items={[
                  {
                    value: "day",
                    label: "Day",
                    icon: (
                      <Calendar className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                    ),
                  },
                  {
                    value: "by-doctor",
                    label: "By doctor",
                    icon: (
                      <Users className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                    ),
                  },
                ]}
              />

              <FilterPaneTriggerButton open={filtersOpen} onOpenChange={setFiltersOpen} />
            </>
          }
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card">
          {calendarView === "week" ? (
            <WeekCalendar
              dates={weekDates}
              appointments={visibleAppointments}
              onApptClick={handleApptClick}
              todayIso={todayIso}
            />
          ) : calendarView === "by-doctor" ? (
            <ByDoctorCalendar
              date={anchorIso}
              appointments={visibleAppointments}
              onApptClick={handleApptClick}
              todayIso={todayIso}
            />
          ) : (
            <DayCalendar
              date={anchorIso}
              appointments={visibleAppointments}
              onApptClick={handleApptClick}
              todayIso={todayIso}
            />
          )}
        </div>

        <ApptDetailSheet
          open={sheetOpen}
          appt={selectedAppt}
          onClose={() => { setSheetOpen(false); setSelectedAppt(null); }}
        />
      </div>
    </TooltipProvider>
  );
}
