"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  PlusCircle,
  Search,
  UserPlus,
  BookOpen,
  GraduationCap,
  X,
  Filter,
  CheckCircle2,
  Phone,
  Mail,
  UserCheck,
  Building2,
  Activity,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  MapPin,
  Globe,
  Award,
  Sparkles,
  Save,
  RefreshCw,
  ExternalLink,
  Eye,
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = (searchParams?.get("tab") as any) || "sekolah";
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<"sekolah" | "siswa" | "pengguna" | "kelas" | "mapel" | "logs">(tabFromUrl);
  const [foundations, setFoundations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync tab with URL
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const changeTab = (tab: "sekolah" | "siswa" | "pengguna" | "kelas" | "mapel" | "logs") => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`);
  };

  // Form School / Foundation Profile
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [savingSchool, setSavingSchool] = useState(false);
  const [schoolSavedSuccess, setSchoolSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter in tabs
  const [searchStudent, setSearchStudent] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"SEMUA" | "GURU" | "ORANG_TUA" | "YAYASAN" | "ADMIN">("SEMUA");

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Form Student
  const [name, setName] = useState("");
  const [nisn, setNisn] = useState("");
  const [disabilityType, setDisabilityType] = useState("Autisme");
  const [jenjang, setJenjang] = useState("SDLB");
  const [gender, setGender] = useState("L");
  const [parentId, setParentId] = useState("");
  const [studentClassId, setStudentClassId] = useState("");

  // Form User Add/Edit
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("slb123");
  const [userRole, setUserRole] = useState("GURU");
  const [userPhone, setUserPhone] = useState("");

  // Form Class
  const [className, setClassName] = useState("");
  const [classJenjang, setClassJenjang] = useState("SDLB");
  const [teacherId, setTeacherId] = useState("");

  // Form Subject
  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");

  // Log filter
  const [logActionFilter, setLogActionFilter] = useState("SEMUA");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resFoundations, resStudents, resUsers, resClasses, resSubjects, resLogs] = await Promise.all([
        fetch("/api/foundations"),
        fetch("/api/students"),
        fetch("/api/users"),
        fetch("/api/classes"),
        fetch("/api/subjects"),
        fetch(`/api/logs?action=${logActionFilter}`),
      ]);

      const dataFoundations = await resFoundations.json();
      const dataStudents = await resStudents.json();
      const dataUsers = await resUsers.json();
      const dataClasses = await resClasses.json();
      const dataSubjects = await resSubjects.json();
      const dataLogs = await resLogs.json();

      const foundList = Array.isArray(dataFoundations) ? dataFoundations : [];
      setFoundations(foundList);
      if (foundList.length > 0) {
        const f = foundList[0];
        setSchoolId(f.id);
        setSchoolName(f.name || "");
        setSchoolCode(f.code || "");
        setSchoolAddress(f.address || "");
        setSchoolPhone(f.phone || "");
        setSchoolLogo(f.logo || "");
      }

      setStudents(Array.isArray(dataStudents) ? dataStudents : []);
      setUsers(Array.isArray(dataUsers) ? dataUsers : []);
      setClasses(Array.isArray(dataClasses) ? dataClasses : []);
      setSubjects(Array.isArray(dataSubjects) ? dataSubjects : []);
      setLogs(Array.isArray(dataLogs) ? dataLogs : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [logActionFilter]);

  // Handle Logo Upload (Base64 file reader)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file logo maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSchoolLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save School Identity
  const handleSaveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchool(true);
    setSchoolSavedSuccess(false);

    try {
      const res = await fetch("/api/foundations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: schoolId || undefined,
          name: schoolName,
          code: schoolCode,
          address: schoolAddress,
          phone: schoolPhone,
          logo: schoolLogo,
        }),
      });

      if (res.ok) {
        setSchoolSavedSuccess(true);
        fetchData();
        setTimeout(() => setSchoolSavedSuccess(false), 4000);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui profil sekolah");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan profil sekolah");
    } finally {
      setSavingSchool(false);
    }
  };

  // Student CRUD Handlers
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nisn,
          disabilityType,
          jenjang,
          gender,
          parentId: parentId || null,
          classId: studentClassId || null,
        }),
      });

      if (res.ok) {
        setIsStudentModalOpen(false);
        setName("");
        setNisn("");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambah siswa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditStudent = (s: any) => {
    setEditingStudentId(s.id);
    setName(s.name || "");
    setNisn(s.nisn || "");
    setDisabilityType(s.disabilityType || "Autisme");
    setJenjang(s.jenjang || "SDLB");
    setGender(s.gender || "L");
    setParentId(s.parentId || "");
    setStudentClassId(s.classes?.[0]?.class?.id || s.classes?.[0]?.classId || "");
    setIsEditStudentModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId) return;

    try {
      const res = await fetch(`/api/students/${editingStudentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nisn,
          disabilityType,
          jenjang,
          gender,
          parentId: parentId || null,
          classId: studentClassId || null,
        }),
      });

      if (res.ok) {
        setIsEditStudentModalOpen(false);
        setEditingStudentId(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui data siswa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id: string, sName: string) => {
    if (!confirm(`Hapus data siswa "${sName}"? Semua asesmen dan rencana PPI siswa ini akan ikut terhapus.`)) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus siswa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User CRUD Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
          phone: userPhone,
        }),
      });

      if (res.ok) {
        setIsUserModalOpen(false);
        setUserName("");
        setUserEmail("");
        setUserPhone("");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambah pengguna");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditUser = (user: any) => {
    setEditingUserId(user.id);
    setUserName(user.name || "");
    setUserEmail(user.email || "");
    setUserRole(user.role || "GURU");
    setUserPhone(user.phone || "");
    setUserPassword("");
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    try {
      const res = await fetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          role: userRole,
          phone: userPhone,
          password: userPassword || undefined,
        }),
      });

      if (res.ok) {
        setIsEditUserModalOpen(false);
        setEditingUserId(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui pengguna");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Hapus akun pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus pengguna");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Class CRUD Handlers
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          jenjang: classJenjang,
          teacherId: teacherId || null,
        }),
      });

      if (res.ok) {
        setIsClassModalOpen(false);
        setClassName("");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambah kelas");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditClass = (c: any) => {
    setEditingClassId(c.id);
    setClassName(c.name || "");
    setClassJenjang(c.jenjang || "SDLB");
    setTeacherId(c.teacherId || c.teacher?.id || "");
    setIsEditClassModalOpen(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClassId) return;

    try {
      const res = await fetch(`/api/classes/${editingClassId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: className,
          jenjang: classJenjang,
          teacherId: teacherId || null,
        }),
      });

      if (res.ok) {
        setIsEditClassModalOpen(false);
        setEditingClassId(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui kelas");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClass = async (id: string, cName: string) => {
    if (!confirm(`Hapus rombel kelas "${cName}"? Siswa di kelas ini tidak akan terhapus namun status kelasnya akan di-reset.`)) return;
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus kelas");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Subject CRUD Handlers
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subjectName,
          description: subjectDesc,
        }),
      });

      if (res.ok) {
        setIsSubjectModalOpen(false);
        setSubjectName("");
        setSubjectDesc("");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambah mata pelajaran");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditSubject = (sub: any) => {
    setEditingSubjectId(sub.id);
    setSubjectName(sub.name || "");
    setSubjectDesc(sub.description || "");
    setIsEditSubjectModalOpen(true);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubjectId) return;

    try {
      const res = await fetch(`/api/subjects/${editingSubjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subjectName,
          description: subjectDesc,
        }),
      });

      if (res.ok) {
        setIsEditSubjectModalOpen(false);
        setEditingSubjectId(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui mata pelajaran");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (id: string, sName: string) => {
    if (!confirm(`Hapus mata pelajaran "${sName}"?`)) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus mata pelajaran");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const parents = users.filter((u) => u.role === "ORANG_TUA");
  const teachers = users.filter((u) => u.role === "GURU");
  const yayasanUsers = users.filter((u) => u.role === "YAYASAN");
  const adminUsers = users.filter((u) => u.role === "ADMIN");

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.nisn.includes(searchStudent) ||
      s.disabilityType.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === "SEMUA" || u.role === userRoleFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.phone?.includes(searchUser) ||
      u.classesTaught?.some((c: any) => c.name?.toLowerCase().includes(searchUser.toLowerCase())) ||
      u.students?.some((s: any) => s.name?.toLowerCase().includes(searchUser.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const openAddUserWithRole = (rolePreset?: string) => {
    setUserName("");
    setUserEmail("");
    setUserPhone("");
    setUserPassword("slb123");
    if (rolePreset && rolePreset !== "SEMUA") {
      setUserRole(rolePreset);
    } else if (userRoleFilter !== "SEMUA") {
      setUserRole(userRoleFilter);
    } else {
      setUserRole("GURU");
    }
    setIsUserModalOpen(true);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <Header
        title={`Super Admin: ${schoolName || "Portal Sekolah SLB"}`}
        subtitle="Pusat Kendali Otoritas Tertinggi: Kustomisasi Identitas Sekolah, Logo, Master Data, & Pengaturan Sistem"
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* Header Action Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {schoolLogo ? (
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg shrink-0 flex items-center justify-center overflow-hidden border-2 border-purple-300/40">
                {schoolLogo.startsWith("data:") || schoolLogo.startsWith("http") ? (
                  <img src={schoolLogo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-3xl">{schoolLogo}</span>
                )}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-purple-700/60 border border-purple-400/40 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                🏫
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-1 text-purple-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Authority
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{schoolName || "Sekolah Luar Biasa"}</h2>
              <p className="text-purple-200 text-xs sm:text-sm mt-0.5 max-w-xl">
                Otoritas penuh untuk mengubah nama & logo sekolah, rombel kelas, data guru & siswa, serta audit trail.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === "sekolah" && (
              <button
                onClick={handleSaveSchoolProfile}
                disabled={savingSchool}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSchool ? "Menyimpan..." : "Simpan Identitas Sekolah"}</span>
              </button>
            )}
            {activeTab === "siswa" && (
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-purple-700" />
                <span>+ Tambah Siswa Baru</span>
              </button>
            )}
            {activeTab === "pengguna" && (
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-purple-700" />
                <span>+ Tambah Pengguna Baru</span>
              </button>
            )}
            {activeTab === "kelas" && (
              <button
                onClick={() => setIsClassModalOpen(true)}
                className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-purple-700" />
                <span>+ Tambah Rombel Kelas</span>
              </button>
            )}
            {activeTab === "mapel" && (
              <button
                onClick={() => setIsSubjectModalOpen(true)}
                className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-purple-700" />
                <span>+ Tambah Mapel Khusus</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Synchronized with Sidebar) */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => changeTab("sekolah")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "sekolah"
                ? "bg-purple-900 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil & Logo Sekolah</span>
          </button>

          <button
            onClick={() => changeTab("siswa")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "siswa"
                ? "bg-purple-900 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Siswa SLB ({students.length})</span>
          </button>

          <button
            onClick={() => changeTab("pengguna")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "pengguna"
                ? "bg-purple-900 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Manajemen Pengguna ({users.length})</span>
          </button>

          <button
            onClick={() => changeTab("kelas")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "kelas"
                ? "bg-purple-900 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Rombel & Jenjang ({classes.length})</span>
          </button>

          <button
            onClick={() => changeTab("mapel")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "mapel"
                ? "bg-purple-900 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mata Pelajaran Khusus ({subjects.length})</span>
          </button>

          <button
            onClick={() => changeTab("logs")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "logs"
                ? "bg-purple-900 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Log Aktivitas Yayasan ({logs.length})</span>
          </button>
        </div>

        {/* TAB 0: PROFIL & LOGO SEKOLAH (SUPER ADMIN) */}
        {activeTab === "sekolah" && (
          <div className="space-y-6 animate-fade-in">
            {schoolSavedSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-2xl flex items-center gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Identitas dan logo sekolah berhasil diperbarui secara sistemik! Semua laporan, kop surat, dan tampilan akan otomatis disesuaikan.</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Input Identitas Sekolah */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-slate-900">Pengaturan Profil & Identitas Lembaga</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ubah nama resmi sekolah, logo, nomor registrasi/NPSN, alamat, dan kontak yang berlaku di seluruh portal
                  </p>
                </div>

                <form onSubmit={handleSaveSchoolProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nama Resmi Sekolah / Yayasan *
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Contoh: SLB Negeri 1 Harapan Bangsa"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Kode Registrasi / NPSN *
                      </label>
                      <input
                        type="text"
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value)}
                        placeholder="Contoh: NPSN-20109988"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        No. Telepon / WhatsApp Resmi
                      </label>
                      <input
                        type="text"
                        value={schoolPhone}
                        onChange={(e) => setSchoolPhone(e.target.value)}
                        placeholder="Contoh: 021-77889900 / 081234567890"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Alamat Lengkap Sekolah & Domisili
                    </label>
                    <textarea
                      rows={2}
                      value={schoolAddress}
                      onChange={(e) => setSchoolAddress(e.target.value)}
                      placeholder="Contoh: Jl. Pendidikan Khusus No. 10, Kel. Inklusi, Kec. Mandiri, Kota Jakarta"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>

                  {/* Logo Upload Section */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Logo Resmi Sekolah (Upload Gambar / URL / Emoji)
                    </label>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs rounded-xl border border-purple-200 transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4 text-purple-700" />
                          <span>Pilih File Logo dari Komputer</span>
                        </button>

                        <span className="text-xs text-slate-400">atau pilih preset:</span>

                        <div className="flex items-center gap-1.5">
                          {["🏫", "🎓", "🌟", "🏛️", "🕊️", "♿"].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setSchoolLogo(emoji)}
                              className={`w-8 h-8 rounded-lg border text-base flex items-center justify-center transition-all ${
                                schoolLogo === emoji
                                  ? "bg-purple-100 border-purple-600 scale-110 shadow-sm"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={schoolLogo}
                          onChange={(e) => setSchoolLogo(e.target.value)}
                          placeholder="Atau tempel URL gambar logo / Base64 image..."
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                        />
                        {schoolLogo && (
                          <button
                            type="button"
                            onClick={() => setSchoolLogo("")}
                            className="p-2 text-slate-400 hover:text-rose-600 text-xs font-bold"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSchool}
                      className="px-6 py-3 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingSchool ? "Menyimpan Perubahan..." : "Simpan Seluruh Perubahan Sekolah"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview Kop Surat & Logo Sekolah */}
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Live Preview Kop & Brand</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif
                    </span>
                  </div>

                  {/* Kop Surat Mockup */}
                  <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl space-y-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                        {schoolLogo ? (
                          schoolLogo.startsWith("data:") || schoolLogo.startsWith("http") ? (
                            <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-2xl">{schoolLogo}</span>
                          )
                        ) : (
                          <span className="text-2xl">🏫</span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm text-slate-900 tracking-tight uppercase">
                          {schoolName || "NAMA SEKOLAH SLB"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          KODE/NPSN: {schoolCode || "20109988"}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-600 leading-tight border-t border-slate-200 pt-2">
                      <p>{schoolAddress || "Alamat lengkap sekolah..."}</p>
                      <p className="mt-0.5">Telp: {schoolPhone || "021-xxxxxxxx"}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl text-[11px] text-purple-950 space-y-1">
                    <strong>💡 Dampak Perubahan:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-purple-800 text-[10px]">
                      <li>Logo dan nama baru otomatis tampil pada Kop Cetak Asesmen & PPI.</li>
                      <li>Nama lembaga pada Dashboard Guru & Orang Tua otomatis tersinkron.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: DATA SISWA */}
        {activeTab === "siswa" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Master Data Seluruh Siswa Berkebutuhan Khusus</h3>
                <p className="text-xs text-slate-500">Kelola mutasi kelas, data orang tua, dan jenjang pendidikan siswa</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama, NISN, disabilitas..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data siswa...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">Tidak ada data siswa yang sesuai.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & NISN</th>
                      <th className="px-6 py-3.5">Rombel & Jenjang</th>
                      <th className="px-6 py-3.5">Disabilitas</th>
                      <th className="px-6 py-3.5">Orang Tua / Wali</th>
                      <th className="px-6 py-3.5">Status PPI</th>
                      <th className="px-6 py-3.5 text-center">Aksi Super Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-slate-500 text-[11px]">
                            NISN: {s.nisn} • Gender: {s.gender === "L" ? "Laki-laki" : "Perempuan"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 block w-max mb-1">
                            {s.jenjang || "SDLB"}
                          </span>
                          <span className="text-slate-600 text-[11px]">
                            {s.classes?.[0]?.class?.name || <span className="text-slate-400 italic">Belum ada kelas</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {s.disabilityType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {s.parent?.name || <span className="text-slate-400 italic">Belum ditautkan</span>}
                        </td>
                        <td className="px-6 py-4">
                          {s.ppiPlans && s.ppiPlans.length > 0 ? (
                            <span className="text-emerald-700 font-bold">✓ Aktif ({s.ppiPlans.length} Target)</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Belum dibuat</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              href={`/guru/siswa/${s.id}`}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-bold text-xs"
                              title="Buka Profil Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => openEditStudent(s)}
                              className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg transition-colors font-bold text-xs"
                              title="Edit Data Siswa & Mutasi Kelas"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteStudent(s.id, s.name)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AKUN PENGGUNA (DIPISAHKAN BERDASARKAN ROLE) */}
        {activeTab === "pengguna" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 animate-fade-in">
            {/* Top Toolbar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-800">Manajemen Pengguna & Otoritas Sistem</h3>
                <p className="text-xs text-slate-500">Kelola akun guru khusus, orang tua siswa, pengurus yayasan, dan admin</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama, email, kelas, anak..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                </div>

                <button
                  onClick={() => openAddUserWithRole(userRoleFilter === "SEMUA" ? "GURU" : userRoleFilter)}
                  className="px-3.5 py-2 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>
                    + Tambah{" "}
                    {userRoleFilter === "GURU"
                      ? "Guru"
                      : userRoleFilter === "ORANG_TUA"
                      ? "Orang Tua"
                      : userRoleFilter === "YAYASAN"
                      ? "Yayasan"
                      : userRoleFilter === "ADMIN"
                      ? "Admin"
                      : "Pengguna"}
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Filter Role Pengguna */}
            <div className="px-5 pt-1 pb-3 flex items-center gap-2 overflow-x-auto border-b border-slate-100">
              <button
                type="button"
                onClick={() => setUserRoleFilter("SEMUA")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  userRoleFilter === "SEMUA"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Semua Pengguna</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${userRoleFilter === "SEMUA" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {users.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserRoleFilter("GURU")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  userRoleFilter === "GURU"
                    ? "bg-teal-700 text-white shadow-sm shadow-teal-700/20"
                    : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60"
                }`}
              >
                <span>👩‍🏫 Guru Khusus SLB</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${userRoleFilter === "GURU" ? "bg-white/20 text-white" : "bg-teal-200 text-teal-900"}`}>
                  {teachers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserRoleFilter("ORANG_TUA")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  userRoleFilter === "ORANG_TUA"
                    ? "bg-rose-700 text-white shadow-sm shadow-rose-700/20"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60"
                }`}
              >
                <span>👨‍👩‍👧 Orang Tua Siswa</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${userRoleFilter === "ORANG_TUA" ? "bg-white/20 text-white" : "bg-rose-200 text-rose-900"}`}>
                  {parents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserRoleFilter("YAYASAN")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  userRoleFilter === "YAYASAN"
                    ? "bg-amber-700 text-white shadow-sm shadow-amber-700/20"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60"
                }`}
              >
                <span>🏛️ Pengurus Yayasan</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${userRoleFilter === "YAYASAN" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-950"}`}>
                  {yayasanUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUserRoleFilter("ADMIN")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  userRoleFilter === "ADMIN"
                    ? "bg-purple-900 text-white shadow-sm shadow-purple-900/20"
                    : "bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200/60"
                }`}
              >
                <span>⚙️ Super Administrator</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${userRoleFilter === "ADMIN" ? "bg-white/20 text-white" : "bg-purple-200 text-purple-950"}`}>
                  {adminUsers.length}
                </span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data pengguna...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Tidak ada data akun pada kategori peran <strong>{userRoleFilter}</strong>.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & Kontak</th>
                      <th className="px-6 py-3.5">Role / Peran</th>
                      <th className="px-6 py-3.5">
                        {userRoleFilter === "GURU"
                          ? "Rombel Kelas Binaan (Wali)"
                          : userRoleFilter === "ORANG_TUA"
                          ? "Anak Binaan / Siswa Terhubung"
                          : "Penugasan & Relasi"}
                      </th>
                      <th className="px-6 py-3.5">Terdaftar</th>
                      <th className="px-6 py-3.5 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                            {u.phone && <span>• {u.phone}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-purple-100 text-purple-900 border border-purple-200"
                                : u.role === "YAYASAN"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : u.role === "GURU"
                                ? "bg-teal-100 text-teal-900 border border-teal-200"
                                : "bg-rose-100 text-rose-900 border border-rose-200"
                            }`}
                          >
                            {u.role === "GURU"
                              ? "GURU KHUSUS"
                              : u.role === "ORANG_TUA"
                              ? "ORANG TUA"
                              : u.role === "YAYASAN"
                              ? "PENGURUS YAYASAN"
                              : "ADMIN YAYASAN"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.role === "GURU" ? (
                            u.classesTaught && u.classesTaught.length > 0 ? (
                              <div className="space-y-1">
                                {u.classesTaught.map((ct: any) => (
                                  <div key={ct.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-900">
                                    <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                                    <span>{ct.name}</span>
                                    <span className="text-[10px] text-teal-600">({ct._count?.students || 0} Siswa)</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Belum ditugaskan rombel</span>
                            )
                          ) : u.role === "ORANG_TUA" ? (
                            u.students && u.students.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {u.students.map((st: any) => (
                                  <span
                                    key={st.id}
                                    className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-bold"
                                  >
                                    👨‍👦 {st.name} ({st.disabilityType} - {st.jenjang})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Belum ditautkan siswa</span>
                            )
                          ) : u.role === "ADMIN" ? (
                            <span className="text-purple-800 text-[11px] font-semibold">Otoritas Penuh Yayasan</span>
                          ) : (
                            <span className="text-amber-800 text-[11px] font-semibold">Akses Monitoring Eksekutif</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditUser(u)}
                              className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
                              title="Edit Akun & Reset Password"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit / Sandi</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ROMBEL JENJANG */}
        {activeTab === "kelas" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">Rombongan Belajar per Jenjang</h3>
                <p className="text-xs text-slate-500">Pemisahan kelas adaptif untuk jenjang TKLB, SDLB, SMPLB, dan SMALB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold rounded-md">
                          {c.jenjang || "SDLB"}
                        </span>
                        <h4 className="font-bold text-base text-slate-900 mt-1">{c.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Wali Kelas: <strong>{c.teacher?.name || "Belum ditentukan"}</strong>
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-purple-50 text-purple-900 text-xs font-bold rounded-xl border border-purple-200">
                        {c._count?.students || 0} Siswa
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3">
                      <span className="font-bold text-slate-700 block mb-1">Daftar Siswa di Kelas Ini:</span>
                      {c.students && c.students.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {c.students.map((cs: any) => (
                            <span
                              key={cs.student.id}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-medium"
                            >
                              {cs.student.name} ({cs.student.disabilityType})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum ada siswa yang ditugaskan.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openEditClass(c)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Ubah Kelas / Wali</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClass(c.id, c.name)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs rounded-lg"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MATA PELAJARAN KHUSUS */}
        {activeTab === "mapel" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">Kurikulum & Mata Pelajaran Khusus</h3>
                <p className="text-xs text-slate-500">Mata pelajaran terapi, bina diri, komunikasi, dan keterampilan vokasional</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-bold text-base text-slate-900">{sub.name}</h4>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      {sub.description || "Mata pelajaran adaptif untuk program khusus SLB."}
                    </p>
                    <div className="text-[11px] text-purple-800 font-semibold pt-1">
                      {sub._count?.materials || 0} Modul Pembelajaran Terkait
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openEditSubject(sub)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(sub.id, sub.name)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs rounded-lg"
                      title="Hapus Mapel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LOG AKTIVITAS (AUDIT TRAIL) */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Jejak Audit & Log Aktivitas Yayasan</h3>
                <p className="text-xs text-slate-500">Rekam jejak setiap aksi mutasi data siswa, asesmen, PPI, dan akun pengguna pada yayasan Anda</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Filter Aksi:</span>
                <select
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold bg-slate-50 text-xs"
                >
                  <option value="SEMUA">Semua Aksi</option>
                  <option value="CREATE">CREATE (Tambah Data)</option>
                  <option value="UPDATE">UPDATE (Perubahan Data)</option>
                  <option value="DELETE">DELETE (Penghapusan)</option>
                  <option value="ASSESSMENT">ASSESSMENT (Asesmen Guru)</option>
                  <option value="EVALUATION">EVALUATION (Evaluasi PPI)</option>
                  <option value="JOURNAL">JOURNAL (Buku Penghubung)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat log aktivitas...</div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">Belum ada catatan log aktivitas.</div>
            ) : (
              <div className="p-5 space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            log.action === "CREATE"
                              ? "bg-emerald-100 text-emerald-900"
                              : log.action === "UPDATE"
                              ? "bg-blue-100 text-blue-900"
                              : log.action === "DELETE"
                              ? "bg-rose-100 text-rose-900"
                              : log.action === "ASSESSMENT"
                              ? "bg-purple-100 text-purple-900"
                              : "bg-teal-100 text-teal-900"
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{log.userName}</span>
                        <span className="text-[10px] font-semibold text-slate-400">({log.userRole})</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{log.description}</p>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium shrink-0">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS SECTION */}

      {/* Modal 1: Tambah Siswa */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Tambah Siswa SLB Baru</h2>
              <button onClick={() => setIsStudentModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0081234509"
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Jenjang SLB *</label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                  >
                    <option value="TKLB">TKLB</option>
                    <option value="SDLB">SDLB</option>
                    <option value="SMPLB">SMPLB</option>
                    <option value="SMALB">SMALB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Disabilitas *</label>
                  <select
                    value={disabilityType}
                    onChange={(e) => setDisabilityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                  >
                    <option value="Autisme">Autisme</option>
                    <option value="Tunarungu">Tunarungu</option>
                    <option value="Tunanetra">Tunanetra</option>
                    <option value="Tunagrahita Ringan">Tunagrahita Ringan</option>
                    <option value="Tunagrahita Sedang">Tunagrahita Sedang</option>
                    <option value="Tunadaksa">Tunadaksa</option>
                    <option value="Slow Learner">Slow Learner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Penugasan Rombel Kelas</label>
                <select
                  value={studentClassId}
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="">-- Pilih Rombel Kelas (Opsional) --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.jenjang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Tautkan Orang Tua</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="">-- Pilih Orang Tua (Opsional) --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">Simpan Siswa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1B: Edit Siswa (Admin) */}
      {isEditStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Edit Data Siswa & Mutasi Kelas</h2>
              <button onClick={() => setIsEditStudentModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Jenjang SLB *</label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                  >
                    <option value="TKLB">TKLB</option>
                    <option value="SDLB">SDLB</option>
                    <option value="SMPLB">SMPLB</option>
                    <option value="SMALB">SMALB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Disabilitas *</label>
                  <select
                    value={disabilityType}
                    onChange={(e) => setDisabilityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                  >
                    <option value="Autisme">Autisme</option>
                    <option value="Tunarungu">Tunarungu</option>
                    <option value="Tunanetra">Tunanetra</option>
                    <option value="Tunagrahita Ringan">Tunagrahita Ringan</option>
                    <option value="Tunagrahita Sedang">Tunagrahita Sedang</option>
                    <option value="Tunadaksa">Tunadaksa</option>
                    <option value="Slow Learner">Slow Learner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Penugasan Rombel Kelas</label>
                <select
                  value={studentClassId}
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="">-- Pilih Rombel Kelas (Opsional) --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.jenjang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Tautkan Orang Tua</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="">-- Pilih Orang Tua (Opsional) --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditStudentModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Tambah Pengguna */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Tambah Akun Pengguna Baru</h2>
              <button onClick={() => setIsUserModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ibu Rina Marlina, S.Pd"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="rina@slb.sch.id"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Kata Sandi Awal *</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Role / Peran *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="GURU">Guru Khusus SLB</option>
                  <option value="ORANG_TUA">Orang Tua Siswa</option>
                  <option value="YAYASAN">Pengurus Yayasan</option>
                  <option value="ADMIN">Admin Yayasan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Pengguna */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Edit Akun Pengguna</h2>
              <button onClick={() => setIsEditUserModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Role / Peran *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="GURU">Guru Khusus SLB</option>
                  <option value="ORANG_TUA">Orang Tua Siswa</option>
                  <option value="YAYASAN">Pengurus Yayasan</option>
                  <option value="ADMIN">Admin Yayasan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Reset Kata Sandi (Kosongkan jika tidak diubah)
                </label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Tambah Kelas */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Tambah Rombel Kelas</h2>
              <button onClick={() => setIsClassModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Rombel Kelas *</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Kelas 3 SDLB - Autisme & Sensori"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Jenjang SLB *</label>
                <select
                  value={classJenjang}
                  onChange={(e) => setClassJenjang(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="TKLB">TKLB</option>
                  <option value="SDLB">SDLB</option>
                  <option value="SMPLB">SMPLB</option>
                  <option value="SMALB">SMALB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Guru Wali Kelas</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="">-- Pilih Guru Wali (Opsional) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">Simpan Kelas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4B: Edit Kelas */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Edit Rombel Kelas & Guru Wali</h2>
              <button onClick={() => setIsEditClassModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateClass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Rombel Kelas *</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Jenjang SLB *</label>
                <select
                  value={classJenjang}
                  onChange={(e) => setClassJenjang(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="TKLB">TKLB</option>
                  <option value="SDLB">SDLB</option>
                  <option value="SMPLB">SMPLB</option>
                  <option value="SMALB">SMALB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Guru Wali Kelas</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm bg-slate-50"
                >
                  <option value="">-- Pilih Guru Wali (Opsional) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditClassModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Tambah Mapel */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Tambah Mata Pelajaran Khusus</h2>
              <button onClick={() => setIsSubjectModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Terapi Okupasi & Kemandirian"
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Deskripsi Mapel</label>
                <textarea
                  rows={3}
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  placeholder="Deskripsikan program mapel ini..."
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">Simpan Mapel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5B: Edit Mapel */}
      {isEditSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-purple-900 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold text-lg">Edit Mata Pelajaran Khusus</h2>
              <button onClick={() => setIsEditSubjectModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Deskripsi Mapel</label>
                <textarea
                  rows={3}
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditSubjectModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Memuat dashboard admin...</div>}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
}
