# 📸 SnapStrip Photobooth

**SnapStrip Photobooth** adalah aplikasi web *photobooth* interaktif bergaya retro yang berjalan 100% di sisi klien (*client-side*). Aplikasi ini memungkinkan pengguna mengambil foto sekuensial menggunakan webcam, mengaplikasikan filter *real-time*, mengostumisasi *frame strip*, serta menyimpan riwayat foto secara lokal tanpa bantuan *backend* server.

![SnapStrip Photobooth Preview](https://raw.githubusercontent.com/nawalauliahasanhunaifa/arsip-laporan-praktikum/main/assets/wip.png)

---

## 🚀 Fitur Utama

* **🎥 Live Camera & Capture Mode**
  * Akses webcam langsung via Browser (HTML5 `navigator.mediaDevices`).
  * Pilihan mode **3 Foto** atau **4 Foto** secara sekuensial.
  * *Countdown timer* interaktif (3 detik) dengan efek *flash* layar saat pengambilan gambar.
  * *Toggle* cermin (*mirroring*) dan penundaan waktu (*delay*).

* **🎨 Filter Kamera Real-Time**
  * Berbagai pilihan filter visual: *Normal*, *B&W/Mono*, *Sepia Warm*, *Vintage Film*, *Cyberpunk*, hingga *Golden Hour*.

* **🎞️ Customization Strip Editor**
  * Layout *photo strip* vertikal khas studio *photobooth*.
  * Kustomisasi warna *frame/background*, penambahan teks, tanggal, serta stiker emoji.

* **💾 Local Storage Persistence**
  * Menyimpan riwayat hasil *photo strip* (format Base64 DataURL) secara otomatis ke browser.
  * Fitur **Galeri Riwayat** untuk melihat, mengunduh ulang, atau menghapus foto yang pernah diambil tanpa menggunakan database external.

* **📥 Export & Download**
  * Konversi visual *photo strip* menjadi file gambar siap unduh (PNG/JPEG kualitas tinggi) menggunakan HTML5 `<canvas>`.

---

## 🛠️ Teknologi yang Digunakan

* **Framework:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons & Animations:** [Lucide React](https://lucide.dev/) & [Framer Motion](https://www.framer.com/motion/)
* **Canvas Processing:** HTML5 Canvas / `html2canvas`
* **Deployment:** GitHub Pages & GitHub Actions

---

## 💻 Cara Menjalankan di Lokal

Jika ingin mencoba atau mengedit project ini di komputer lokal:

1. **Clone repository ini:**
   ```bash
   git clone [https://github.com/USERNAME/snapstrip-photobooth.git](https://github.com/USERNAME/snapstrip-photobooth.git)
   cd snapstrip-photobooth
