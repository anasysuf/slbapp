"use client";

import { useState, useEffect, Suspense } from "react";
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
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = (searchParams?.get("tab") as any) || "siswa";
  const { data: session } = useSession();
  const foundationName = (session?.user as any)?.foundationName || "Yayasan Pendidikan Harapan Mulia";

  const [activeTab, setActiveTab] = useState<"siswa" | "pengguna" | "kelas" | "mapel" | "logs">(tabFromUrl);
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

  const changeTab = (tab: "siswa" | "pengguna" | "kelas" | "mapel" | "logs") => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`);
  };

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Form Student
  const [name, setName] = useState("");
  const [nisn, setNisn] = useState("");
  const [disabilityType, setDisabilityType] = useState("Autisme");
  const [jenjang, setJenjang] = useState("SDLB");
  const [gender, setGender] = useState("L");
  const [parentId, setParentId] = useState("");
  const [studentClassId, setStudentClassId] = useState("");

  // Form User Add/Edit
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
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
      const [resStudents, resUsers, resClasses, resSubjects, resLogs] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/users"),
        fetch("/api/classes"),
        fetch("/api/subjects"),
        fetch(`/api/logs?action=${logActionFilter}`),
      ]);

      const dataStudents = await resStudents.json();
      const dataUsers = await resUsers.json();
      const dataClasses = await resClasses.json();
      const dataSubjects = await resSubjects.json();
      const dataLogs = await resLogs.json();

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

  // Handlers
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

  const parents = users.filter((u) => u.role === "ORANG_TUA");
  const teachers = users.filter((u) => u.role === "GURU");

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <Header
        title={`Admin Yayasan: ${foundationName}`}
        subtitle="Pusat Kendali Manajemen Data Siswa, Pengguna, Rombel Jenjang & Log Aktivitas"
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* Header Action Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold mb-2 text-purple-200">
              <Building2 className="w-3.5 h-3.5" /> {foundationName}
            </div>
            <h2 className="text-xl sm:text-2xl font-black">Admin Portal Yayasan</h2>
            <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
              Hak akses penuh untuk mengelola guru, siswa, kelas per jenjang (TKLB - SMALB), dan memantau log aktivitas pada yayasan Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
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

        {/* TAB 1: DATA SISWA */}
        {activeTab === "siswa" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">Daftar Siswa SLB Terdaftar</h3>
                <p className="text-xs text-slate-500">Mencakup jenjang TKLB, SDLB, SMPLB, dan SMALB</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data siswa...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & NISN</th>
                      <th className="px-6 py-3.5">Jenjang & Kelas</th>
                      <th className="px-6 py-3.5">Disabilitas</th>
                      <th className="px-6 py-3.5">Orang Tua</th>
                      <th className="px-6 py-3.5">Status PPI</th>
                      <th className="px-6 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-slate-500 text-[11px]">NISN: {s.nisn} ({s.gender})</div>
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
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/guru/siswa/${s.id}`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors text-xs inline-block"
                          >
                            Buka Profil
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AKUN PENGGUNA */}
        {activeTab === "pengguna" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">Manajemen Akun Pengguna Yayasan</h3>
                <p className="text-xs text-slate-500">Kelola akun guru khusus, orang tua siswa, dan pengurus yayasan</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data pengguna...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & Kontak</th>
                      <th className="px-6 py-3.5">Role / Peran</th>
                      <th className="px-6 py-3.5">Terdaftar</th>
                      <th className="px-6 py-3.5 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {u.email}
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
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}
                          >
                            {u.role}
                          </span>
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
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                              title="Hapus Pengguna"
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">Rombongan Belajar per Jenjang</h3>
                <p className="text-xs text-slate-500">Pemisahan kelas adaptif untuk jenjang TKLB, SDLB, SMPLB, dan SMALB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
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

                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
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
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MATA PELAJARAN KHUSUS */}
        {activeTab === "mapel" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800">Kurikulum & Mata Pelajaran Khusus</h3>
                <p className="text-xs text-slate-500">Mata pelajaran terapi, bina diri, komunikasi, dan keterampilan vokasional</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-base text-slate-900">{sub.name}</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {sub.description || "Mata pelajaran adaptif untuk program khusus SLB."}
                  </p>
                  <div className="text-[11px] text-purple-800 font-semibold pt-1">
                    {sub._count?.materials || 0} Modul Pembelajaran Terkait
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LOG AKTIVITAS (AUDIT TRAIL) */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
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

      {/* Modals */}
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
                    <option value="Tunadaksa">Tunadaksa</option>
                    <option value="Slow Learner">Slow Learner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Penugasan Kelas</label>
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
