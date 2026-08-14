"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Users,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  X,
  CheckCircle2,
  FileText,
  HeartHandshake,
  BookOpen,
  Eye,
  UserCheck,
  Download,
} from "lucide-react";
import Footer from "@/components/Footer";
import { exportStudentsToCsv } from "@/lib/exportUtils";



export default function GuruStudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDisability, setSelectedDisability] = useState("SEMUA");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [nisn, setNisn] = useState("");
  const [disabilityType, setDisabilityType] = useState("Autisme");
  const [gender, setGender] = useState("L");
  const [parentId, setParentId] = useState("");

  const teacherClass = classes[0];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStudents, resClasses, resUsers] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/classes"),
        fetch("/api/users?role=ORANG_TUA"),
      ]);

      const dataStudents = await resStudents.json();
      const dataClasses = await resClasses.json();
      const dataUsers = await resUsers.json();

      setStudents(Array.isArray(dataStudents) ? dataStudents : []);
      setClasses(Array.isArray(dataClasses) ? dataClasses : []);
      setParents(Array.isArray(dataUsers) ? dataUsers : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherClass) {
      alert("Akun Anda belum memiliki penugasan rombel kelas oleh Admin");
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nisn,
          disabilityType,
          jenjang: teacherClass.jenjang,
          gender,
          parentId: parentId || null,
          classId: teacherClass.id,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        resetForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambah data siswa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setName(student.name);
    setNisn(student.nisn);
    setDisabilityType(student.disabilityType);
    setGender(student.gender || "L");
    setParentId(student.parentId || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nisn,
          disabilityType,
          gender,
          parentId: parentId || null,
        }),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        resetForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui data siswa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id: string, studentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data siswa "${studentName}"? Tindakan ini akan menghapus seluruh data PPI dan asesmen terkait.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus data siswa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingStudent(null);
    setName("");
    setNisn("");
    setDisabilityType("Autisme");
    setGender("L");
    setParentId("");
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search);
    const matchDisability = selectedDisability === "SEMUA" || s.disabilityType === selectedDisability;
    return matchSearch && matchDisability;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title="Manajemen Siswa Kelas (Guru SLB)"
          subtitle="Daftar Siswa Khusus Rombel Binaan yang Ditetapkan oleh Administrator Sekolah"
        />

        <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Action & Stats Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold text-teal-200">
                <Users className="w-3.5 h-3.5" /> Portal Khusus Guru Kelas
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {teacherClass ? teacherClass.name : "Rombel Kelas Binaan"}
              </h2>
              <p className="text-teal-100 text-xs sm:text-sm max-w-xl leading-relaxed">
                {teacherClass ? (
                  <>
                    Jenjang: <strong>{teacherClass.jenjang}</strong> • Anda mengampu <strong>{students.length} peserta didik</strong> pada rombel ini. Penugasan kelas dan penyesuaian jenjang diatur oleh Admin Sekolah.
                  </>
                ) : (
                  "Akun Anda belum memiliki penugasan rombel kelas oleh Admin."
                )}
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              disabled={!teacherClass}
              className="px-5 py-3 bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 self-start md:self-auto transition-transform hover:scale-105 disabled:opacity-50 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-teal-700" />
              <span>+ Tambah Siswa ke Kelas Saya</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nama siswa atau NISN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium"
              />
            </div>

            {/* Filter Disabilitas */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600">Disabilitas:</span>
              <select
                value={selectedDisability}
                onChange={(e) => setSelectedDisability(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-teal-500"
              >
                <option value="SEMUA">Semua Disabilitas ({students.length})</option>
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

          {/* Students Grid / Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-base text-slate-800">
                Daftar Peserta Didik ({filteredStudents.length} Siswa)
              </h3>

              <button
                onClick={() => exportStudentsToCsv(filteredStudents, "Rekap_Siswa_Kelas_Binaan")}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 border border-teal-200"
                title="Unduh Rekap Siswa ke CSV / Excel"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span>Unduh Rekap Siswa (CSV)</span>
              </button>
            </div>


            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Memuat data siswa...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Tidak ada siswa yang sesuai dengan filter pencarian.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs">

                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama & NISN</th>
                      <th className="px-6 py-3.5">Jenjang & Kelas</th>
                      <th className="px-6 py-3.5">Jenis Disabilitas</th>
                      <th className="px-6 py-3.5">Orang Tua / Wali</th>
                      <th className="px-6 py-3.5">Status PPI</th>
                      <th className="px-6 py-3.5 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-slate-500 text-[11px]">NISN: {s.nisn} ({s.gender === "P" ? "Perempuan" : "Laki-laki"})</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 block w-max mb-1">
                            {s.jenjang || "SDLB"}
                          </span>
                          <span className="text-slate-600 text-[11px] font-medium">
                            {s.classes?.[0]?.class?.name || <span className="text-slate-400 italic">Belum ada kelas</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {s.disabilityType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {s.parent?.name ? (
                            <div>
                              <div className="font-semibold text-slate-900">{s.parent.name}</div>
                              <div className="text-[10px] text-slate-500">{s.parent.phone || s.parent.email}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditautkan</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {s.ppiPlans && s.ppiPlans.length > 0 ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{s.ppiPlans.length} Target PPI</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">Belum ada PPI</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              href={`/guru/siswa/${s.id}`}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                              title="Buka Profil Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Profil</span>
                            </Link>

                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors"
                              title="Edit Data Siswa"
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
        </div>
        <Footer />
      </main>


      {/* Modal Tambah Siswa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-teal-800 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Tambah Siswa Baru ke Kelas</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 font-semibold"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 font-semibold"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Disabilitas *</label>
                <select
                  value={disabilityType}
                  onChange={(e) => setDisabilityType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 font-semibold"
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

              {/* Rombel & Jenjang Info Box (Auto-assigned by Admin) */}
              <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Rombel Kelas & Jenjang Tetap:</span>
                </div>
                <div className="text-xs font-black text-teal-950 flex items-center justify-between">
                  <span>{teacherClass?.name || "Kelas Binaan"}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-teal-700 text-white text-[10px] font-bold">
                    {teacherClass?.jenjang || "SDLB"}
                  </span>
                </div>
                <p className="text-[10px] text-teal-700 italic">
                  * Otomatis terdaftar ke kelas binaan Anda yang telah ditetapkan oleh Admin Sekolah.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Tautkan Orang Tua / Wali</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 font-semibold"
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
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-700/20 transition-all">Simpan Siswa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Siswa */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-teal-800 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h2 className="font-bold text-base sm:text-lg">Edit Data Siswa</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 font-semibold"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 font-semibold"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Disabilitas *</label>
                <select
                  value={disabilityType}
                  onChange={(e) => setDisabilityType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 font-semibold"
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

              {/* Rombel & Jenjang Info Box (Readonly) */}
              <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Rombel Kelas & Jenjang Siswa:</span>
                </div>
                <div className="text-xs font-black text-teal-950 flex items-center justify-between">
                  <span>{editingStudent?.classes?.[0]?.class?.name || teacherClass?.name || "Kelas Binaan"}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-teal-700 text-white text-[10px] font-bold">
                    {editingStudent?.jenjang || teacherClass?.jenjang || "SDLB"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  * Penugasan kelas dan mutasi jenjang siswa dikelola terpusat oleh Admin Sekolah.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Tautkan Orang Tua / Wali</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-slate-50 font-semibold"
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
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-700/20 transition-all">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
