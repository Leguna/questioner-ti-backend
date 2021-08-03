class IkadCalculator {
  constructor (
    persenBelajarMengajar = 60,
    persenKehadiranMemberiKuliah = 20,
    persenPenyerahanNilai = 20,
    totalPP = 2.8,
    penelitian = 0.6,
    pengabdian = 0.6
  ) {
    this.persenBelajarMengajar = persenBelajarMengajar / 100
    this.persenKehadiranMemberiKuliah = persenKehadiranMemberiKuliah / 100
    this.persenPenyerahanNilai = persenPenyerahanNilai / 100
    this.totalPP = totalPP
    this.penelitian = penelitian
    this.pengabdian = pengabdian
    this.maxIkad = totalPP + penelitian + pengabdian
  }

  hitungSkorIkad (skorIkadPBM, kehadiran, waktuSerahNilai, penelitianDosen, pkm) {
    const nilaiBelajarMengajar = (this.totalPP * skorIkadPBM / 4) * this.persenBelajarMengajar
    const nilaiKehadiran = (this.totalPP * kehadiran / 19) * this.persenKehadiranMemberiKuliah
    const nilaiPemberianNilai = (this.totalPP * waktuSerahNilai / 4) * this.persenPenyerahanNilai
    const nilaiTotalPP = (nilaiBelajarMengajar + nilaiKehadiran + nilaiPemberianNilai)

    const nilaiPenelitian = (2.8 * skorIkadPBM / 4) * 0.6
    const nilaiPengabdianKeMasayarakat = (2.8 * skorIkadPBM / 4) * 0.6
    const ikad = (nilaiTotalPP + nilaiPenelitian + nilaiPengabdianKeMasayarakat)

    return {
      nilaiBelajarMengajar,
      nilaiKehadiran,
      nilaiPemberianNilai,
      nilaiTotalPP,
      nilaiPenelitian,
      nilaiPengabdianKeMasayarakat,
      ikad
    }
  }
}

module.exports = {
  IkadCalculator
}
