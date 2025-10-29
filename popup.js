// popup.js
document.getElementById('isiEPBM').addEventListener('click', () => {
  const pilihanJawaban = document.getElementById('pilihanJawaban').value; // Ini akan menghasilkan '1', '2', '3', atau '4'

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Tambahkan delay kecil untuk memastikan modal sepenuhnya dimuat
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: fillEPBM,
        args: [pilihanJawaban]
      });
    }, 500); // Delay 500 milidetik (0.5 detik). Bisa disesuaikan.
  });
});

function fillEPBM(targetPilihan) {
  console.log('Mulai mengisi EPBM dengan pilihan:', targetPilihan);

  // Mengidentifikasi index radio button yang harus diklik dalam setiap grup 4 opsi
  // Pilihan di dropdown (1,2,3,4) sesuai dengan poin.
  // Poin 1 (Kurang Baik/Jelas) = index 0
  // Poin 2 (Cukup Baik/Jelas) = index 1
  // Poin 3 (Baik/Jelas)        = index 2
  // Poin 4 (Sangat Baik/Jelas) = index 3
  let targetIndexForGroup;
  switch (targetPilihan) {
    case '1': targetIndexForGroup = 0; break;
    case '2': targetIndexForGroup = 1; break;
    case '3': targetIndexForGroup = 2; break;
    case '4': targetIndexForGroup = 3; break;
    default:
      console.error('Pilihan tidak valid:', targetPilihan);
      alert('Pilihan tidak valid. Silakan pilih 1, 2, 3, atau 4.');
      return;
  }

  // Ambil semua div yang membungkus setiap radio button dan labelnya
  // Ini adalah selector yang lebih spesifik berdasarkan struktur HTML yang Anda berikan.
  const allOptionDivs = document.querySelectorAll('div.d-flex.mx-2.align-items-center.justify-content-center');
  let filledCount = 0;
  let currentGroupOptionCount = 0; // Menghitung opsi dalam grup 4

  // Pastikan ada div opsi yang ditemukan
  if (allOptionDivs.length === 0) {
    console.warn('Tidak ditemukan elemen div opsi radio button. Selector mungkin salah.');
    alert('Tidak ada opsi pertanyaan yang ditemukan. Pastikan Anda berada di halaman EPBM yang benar dan formulir sudah dimuat.');
    return;
  }

  allOptionDivs.forEach(optionDiv => {
    // Cari input radio di dalam div opsi saat ini
    const radio = optionDiv.querySelector('input[type="radio"]');

    if (radio && radio.offsetParent !== null) { // Pastikan radio button ditemukan dan terlihat
      // Jika ini adalah awal dari kelompok 4 opsi untuk pertanyaan baru, reset counter
      // Kita asumsikan setiap 4 div ini adalah satu pertanyaan.
      // Jika nomor pertanyaan ke-5 bukan kelipatan 4, bisa jadi ada masalah di sini.
      if (currentGroupOptionCount === 4) {
          currentGroupOptionCount = 0;
      }
      
      // Cek apakah radio button ini adalah opsi yang kita inginkan dalam grup 4
      if (currentGroupOptionCount === targetIndexForGroup) {
        radio.click();
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        radio.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`Radio button untuk pertanyaan #${filledCount + 1} diklik: name="${radio.name}", value="${radio.value}"`);
        filledCount++;
      }
      currentGroupOptionCount++; // Increment counter setelah memproses opsi
    }
  });

  if (filledCount === 0) {
    console.warn('Tidak ada pertanyaan yang berhasil diisi. Mungkin ada masalah dengan selector atau elemen tidak terlihat.');
    alert('Tidak ada pertanyaan yang berhasil diisi. Periksa konsol untuk detail lebih lanjut.');
  } else {
    console.log(`Berhasil mengisi ${filledCount} pertanyaan EPBM.`);
    alert(`EPBM berhasil diisi otomatis (${filledCount} pertanyaan)! Mohon periksa kembali sebelum menyimpan.`);
  }
}