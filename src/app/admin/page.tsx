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
  HeartHandshake,
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = (searchParams?.get("tab") as any) || "sekolah";
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<"sekolah" | "siswa" | "guru" | "ortu" | "yayasan" | "admin" | "pengguna" | "kelas" | "mapel" | "logs">(tabFromUrl);
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

  const changeTab = (tab: "sekolah" | "siswa" | "guru" | "ortu" | "yayasan" | "admin" | "pengguna" | "kelas" | "mapel" | "logs") => {
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
  const [schoolAcademicYear, setSchoolAcademicYear] = useState("2026/2027");
  const [schoolSemester, setSchoolSemester] = useState("Ganjil");
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
        setSchoolAcademicYear(f.academicYear || "2026/2027");
        setSchoolSemester(f.semester || "Ganjil");
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
          academicYear: schoolAcademicYear,
          semester: schoolSemester,
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
            {activeTab === "guru" && (
              <button
                onClick={() => openAddUserWithRole("GURU")}
                className="px-4 py-2.5 bg-white text-teal-950 hover:bg-teal-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-teal-700" />
                <span>+ Tambah Guru Baru</span>
              </button>
            )}
            {activeTab === "ortu" && (
              <button
                onClick={() => openAddUserWithRole("ORANG_TUA")}
                className="px-4 py-2.5 bg-white text-rose-950 hover:bg-rose-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-rose-700" />
                <span>+ Tambah Orang Tua Baru</span>
              </button>
            )}
            {activeTab === "yayasan" && (
              <button
                onClick={() => openAddUserWithRole("YAYASAN")}
                className="px-4 py-2.5 bg-white text-amber-950 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-amber-700" />
                <span>+ Tambah Pengurus Yayasan</span>
              </button>
            )}
            {activeTab === "admin" && (
              <button
                onClick={() => openAddUserWithRole("ADMIN")}
                className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-purple-700" />
                <span>+ Tambah Administrator Baru</span>
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
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => changeTab("sekolah")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "sekolah"
                ? "bg-purple-900 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil & Logo</span>
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
            <span>Data Siswa ({students.length})</span>
          </button>

          {/* Individual Menus per User Role */}
          <button
            onClick={() => changeTab("guru")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "guru"
                ? "bg-teal-800 text-white shadow shadow-teal-800/30"
                : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/70"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Guru Khusus ({teachers.length})</span>
          </button>

          <button
            onClick={() => changeTab("ortu")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "ortu"
                ? "bg-rose-800 text-white shadow shadow-rose-800/30"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/70"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Orang Tua ({parents.length})</span>
          </button>

          <button
            onClick={() => changeTab("yayasan")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "yayasan"
                ? "bg-amber-800 text-white shadow shadow-amber-800/30"
                : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/70"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Yayasan ({yayasanUsers.length})</span>
          </button>

          <button
            onClick={() => changeTab("admin")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "admin"
                ? "bg-purple-900 text-white shadow shadow-purple-900/30"
                : "bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200/70"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin ({adminUsers.length})</span>
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
            <span>Mata Pelajaran ({subjects.length})</span>
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
            <span>Log Aktivitas ({logs.length})</span>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Tahun Ajaran Aktif Sekolah *
                      </label>
                      <select
                        value={schoolAcademicYear}
                        onChange={(e) => setSchoolAcademicYear(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      >
                        <option value="2026/2027">2026/2027</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2024/2025">2024/2025</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Semester Aktif Sekolah *
                      </label>
                      <select
                        value={schoolSemester}
                        onChange={(e) => setSchoolSemester(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                      >
                        <option value="Ganjil">Semester Ganjil</option>
                        <option value="Genap">Semester Genap</option>
                      </select>
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

        {/* TAB GURU: MANAJEMEN GURU KHUSUS SLB */}
        {activeTab === "guru" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Manajemen Guru Khusus SLB</h3>
                  <p className="text-xs text-slate-500">Kelola akun pendidik khusus, rombel kelas binaan, dan kontak WhatsApp guru</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama, email, kelas guru..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                  />
                </div>

                <button
                  onClick={() => openAddUserWithRole("GURU")}
                  className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Guru</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data guru...</div>
            ) : teachers.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">Belum ada akun guru yang terdaftar.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & Kontak Guru</th>
                      <th className="px-6 py-3.5">Rombel Kelas Binaan (Wali Kelas)</th>
                      <th className="px-6 py-3.5 text-center">Jumlah Siswa</th>
                      <th className="px-6 py-3.5 text-center">Asesmen Dibuat</th>
                      <th className="px-6 py-3.5">Terdaftar</th>
                      <th className="px-6 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers
                      .filter((u) => {
                        const q = searchUser.toLowerCase();
                        return (
                          u.name?.toLowerCase().includes(q) ||
                          u.email?.toLowerCase().includes(q) ||
                          u.phone?.includes(q) ||
                          u.classesTaught?.some((c: any) => c.name?.toLowerCase().includes(q))
                        );
                      })
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{u.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                Pendidik Khusus
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                              {u.phone && <span>• {u.phone}</span>}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {u.classesTaught && u.classesTaught.length > 0 ? (
                              <div className="space-y-1">
                                {u.classesTaught.map((ct: any) => (
                                  <div key={ct.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-900">
                                    <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                                    <span>{ct.name}</span>
                                    <span className="text-[10px] text-teal-600 font-semibold">({ct.jenjang})</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Belum ditugaskan rombel</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center font-bold text-slate-800 text-xs">
                            {u.classesTaught?.reduce((acc: number, c: any) => acc + (c._count?.students || 0), 0) || 0} Siswa
                          </td>

                          <td className="px-6 py-4 text-center font-bold text-slate-800 text-xs">
                            {u._count?.assessments || 0} Instrumen
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString("id-ID")}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditUser(u)}
                                className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
                                title="Edit Akun & Reset Password"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit / Sandi</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                                title="Hapus Akun Guru"
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

        {/* TAB ORTU: MANAJEMEN ORANG TUA SISWA */}
        {activeTab === "ortu" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Manajemen Orang Tua Siswa</h3>
                  <p className="text-xs text-slate-500">Kelola akun wali murid, anak/siswa binaan yang ditautkan, dan akses Portal Ortu</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama orang tua, anak..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-600 font-medium"
                  />
                </div>

                <button
                  onClick={() => openAddUserWithRole("ORANG_TUA")}
                  className="px-3.5 py-2 bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Orang Tua</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data orang tua...</div>
            ) : parents.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">Belum ada akun orang tua yang terdaftar.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & Kontak Orang Tua</th>
                      <th className="px-6 py-3.5">Anak / Siswa yang Terhubung</th>
                      <th className="px-6 py-3.5 text-center">Jumlah Anak</th>
                      <th className="px-6 py-3.5">Terdaftar</th>
                      <th className="px-6 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parents
                      .filter((u) => {
                        const q = searchUser.toLowerCase();
                        return (
                          u.name?.toLowerCase().includes(q) ||
                          u.email?.toLowerCase().includes(q) ||
                          u.phone?.includes(q) ||
                          u.students?.some((s: any) => s.name?.toLowerCase().includes(q))
                        );
                      })
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{u.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Wali Murid
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                              {u.phone && <span>• {u.phone}</span>}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {u.students && u.students.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {u.students.map((st: any) => (
                                  <span
                                    key={st.id}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-bold inline-flex items-center gap-1"
                                  >
                                    👨‍👦 {st.name} ({st.disabilityType} - {st.jenjang})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Belum ditautkan siswa binaan</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center font-bold text-slate-800 text-xs">
                            {u.students?.length || 0} Anak
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString("id-ID")}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditUser(u)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
                                title="Edit Akun & Reset Password"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit / Sandi</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                                title="Hapus Akun Orang Tua"
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

        {/* TAB YAYASAN: MANAJEMEN PENGURUS YAYASAN */}
        {activeTab === "yayasan" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Manajemen Pengurus Yayasan</h3>
                  <p className="text-xs text-slate-500">Kelola akun pimpinan dan pengurus yayasan dengan hak akses monitoring eksekutif</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama, email pengurus..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium"
                  />
                </div>

                <button
                  onClick={() => openAddUserWithRole("YAYASAN")}
                  className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Yayasan</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data pengurus yayasan...</div>
            ) : yayasanUsers.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">Belum ada akun yayasan yang terdaftar.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & Kontak Pengurus</th>
                      <th className="px-6 py-3.5">Peran & Lingkup Otoritas</th>
                      <th className="px-6 py-3.5">Yayasan Terhubung</th>
                      <th className="px-6 py-3.5">Terdaftar</th>
                      <th className="px-6 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {yayasanUsers
                      .filter((u) => {
                        const q = searchUser.toLowerCase();
                        return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
                      })
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{u.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                Pengurus Yayasan
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                              {u.phone && <span>• {u.phone}</span>}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-amber-900 font-semibold text-[11px] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                              Akses Monitoring Eksekutif
                            </span>
                          </td>

                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {u.foundation?.name || schoolName || "Yayasan Terhubung"}
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString("id-ID")}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditUser(u)}
                                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors font-bold text-xs flex items-center gap-1"
                                title="Edit Akun & Reset Password"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit / Sandi</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                                title="Hapus Akun Yayasan"
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

        {/* TAB ADMIN: MANAJEMEN SUPER ADMINISTRATOR */}
        {activeTab === "admin" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Manajemen Super Administrator</h3>
                  <p className="text-xs text-slate-500">Kelola akun administrator dengan otoritas penuh konfigurasi sistem dan identitas sekolah</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama, email admin..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                  />
                </div>

                <button
                  onClick={() => openAddUserWithRole("ADMIN")}
                  className="px-3.5 py-2 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Admin</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data administrator...</div>
            ) : adminUsers.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">Belum ada akun admin yang terdaftar.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & Kontak Administrator</th>
                      <th className="px-6 py-3.5">Tingkat Hak Akses</th>
                      <th className="px-6 py-3.5">Yayasan / Sekolah</th>
                      <th className="px-6 py-3.5">Terdaftar</th>
                      <th className="px-6 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsers
                      .filter((u) => {
                        const q = searchUser.toLowerCase();
                        return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
                      })
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{u.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                                Super Administrator
                              </span>
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                              {u.phone && <span>• {u.phone}</span>}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-purple-900 font-bold text-[11px] bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                              Otoritas Penuh & Master Data
                            </span>
                          </td>

                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {u.foundation?.name || schoolName || "Yayasan SLB"}
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
                                title="Hapus Akun Admin"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Tambah Siswa SLB Baru</h2>
              <button onClick={() => setIsStudentModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0081234509"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Jenjang SLB *</label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  >
                    <option value="TKLB">TKLB</option>
                    <option value="SDLB">SDLB</option>
                    <option value="SMPLB">SMPLB</option>
                    <option value="SMALB">SMALB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Disabilitas *</label>
                  <select
                    value={disabilityType}
                    onChange={(e) => setDisabilityType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Penugasan Rombel Kelas</label>
                <select
                  value={studentClassId}
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Tautkan Orang Tua</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  <option value="">-- Pilih Orang Tua (Opsional) --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all">Simpan Siswa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1B: Edit Siswa (Admin) */}
      {isEditStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Edit Data Siswa & Mutasi Kelas</h2>
              <button onClick={() => setIsEditStudentModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Jenjang SLB *</label>
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  >
                    <option value="TKLB">TKLB</option>
                    <option value="SDLB">SDLB</option>
                    <option value="SMPLB">SMPLB</option>
                    <option value="SMALB">SMALB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Disabilitas *</label>
                  <select
                    value={disabilityType}
                    onChange={(e) => setDisabilityType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Mutasi / Penugasan Rombel Kelas</label>
                <select
                  value={studentClassId}
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Tautkan Orang Tua</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  <option value="">-- Pilih Orang Tua (Opsional) --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditStudentModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Tambah Pengguna */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Tambah Akun Pengguna Baru</h2>
              <button onClick={() => setIsUserModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ibu Rina Marlina, S.Pd"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="rina@slb.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Kata Sandi Awal *</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Role / Peran *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  <option value="GURU">Guru Khusus SLB</option>
                  <option value="ORANG_TUA">Orang Tua Siswa</option>
                  <option value="YAYASAN">Pengurus Yayasan</option>
                  <option value="ADMIN">Super Admin Yayasan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all">Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Pengguna */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Edit Akun Pengguna & Reset Password</h2>
              <button onClick={() => setIsEditUserModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Role / Peran *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  <option value="GURU">Guru Khusus SLB</option>
                  <option value="ORANG_TUA">Orang Tua Siswa</option>
                  <option value="YAYASAN">Pengurus Yayasan</option>
                  <option value="ADMIN">Super Admin Yayasan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reset Kata Sandi (Kosongkan jika tidak diubah)
                </label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Ketik password baru jika ingin mereset..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Tambah Kelas */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Tambah Rombel Kelas Baru</h2>
              <button onClick={() => setIsClassModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Rombel Kelas *</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Kelas 3 SDLB - Autisme & Sensori"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Jenjang SLB *</label>
                <select
                  value={classJenjang}
                  onChange={(e) => setClassJenjang(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  <option value="TKLB">TKLB</option>
                  <option value="SDLB">SDLB</option>
                  <option value="SMPLB">SMPLB</option>
                  <option value="SMALB">SMALB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Guru Wali Kelas</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  <option value="">-- Pilih Guru Wali (Opsional) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all">Simpan Kelas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4B: Edit Kelas */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Edit Rombel Kelas & Guru Wali</h2>
              <button onClick={() => setIsEditClassModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateClass} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Rombel Kelas *</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Jenjang SLB *</label>
                <select
                  value={classJenjang}
                  onChange={(e) => setClassJenjang(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  <option value="TKLB">TKLB</option>
                  <option value="SDLB">SDLB</option>
                  <option value="SMPLB">SMPLB</option>
                  <option value="SMALB">SMALB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Guru Wali Kelas</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  <option value="">-- Pilih Guru Wali (Opsional) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditClassModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Tambah Mapel */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Tambah Mata Pelajaran Khusus</h2>
              <button onClick={() => setIsSubjectModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Terapi Okupasi & Kemandirian"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Deskripsi Mapel</label>
                <textarea
                  rows={3}
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  placeholder="Deskripsikan program mapel ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all">Simpan Mapel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5B: Edit Mapel */}
      {isEditSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Edit Mata Pelajaran Khusus</h2>
              <button onClick={() => setIsEditSubjectModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubject} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Deskripsi Mapel</label>
                <textarea
                  rows={3}
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditSubjectModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all">Simpan Perubahan</button>
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
