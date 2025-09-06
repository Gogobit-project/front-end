// /hooks/useUserSubmissions.ts
"use client";

import { useState, useEffect } from "react";
import { UserSubmission } from "@/lib/types";
import { MOCK_USER_SUBMISSIONS } from "@/lib/constans";

export const useUserSubmissions = () => {
  // 1. State untuk menyimpan data submissions
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);

  // 2. State untuk menandakan proses loading (ini best practice!)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 3. Fungsi untuk "mengambil" data.
    // Kita buat async agar polanya sama seperti mengambil data dari API sungguhan.
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);

        // --- SIMULASI PENGAMBILAN DATA ---
        // Di masa depan, Anda akan mengganti bagian ini dengan panggilan API/Subgraph
        // Contoh: const realData = await fetch('https://api.anda.com/submissions');
        // setSubmissions(await realData.json());

        // Untuk sekarang, kita gunakan mock data yang sudah ada.
        // Kita beri jeda 500ms agar loading spinner sempat terlihat.
        await new Promise((resolve) => setTimeout(resolve, 500));

        setSubmissions(MOCK_USER_SUBMISSIONS);
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
        // Di sini Anda bisa menambahkan state untuk error jika perlu
        setSubmissions([]); // Kosongkan data jika gagal
      } finally {
        // Apapun yang terjadi (berhasil atau gagal), loading harus selesai.
        setIsLoading(false);
      }
    };

    fetchSubmissions();

    // Dependency array kita kosongkan `[]` karena hook ini belum bergantung pada
    // state atau props lain (seperti `account`). Ia hanya berjalan sekali saat komponen mount.
  }, []);

  // 4. Kembalikan state yang dibutuhkan oleh komponen
  return { submissions, isLoading };
};
