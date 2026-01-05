/** @format */

const mongoose = require("mongoose");
const Metadata = require("../routes/metadata/model");
const { STATUS } = require("../config/enum");

const metadataSeeds = [
  {
    page: "home",
    title: "Excelearn - Solusi Pembelajaran Terpadu",
    description: "Excelearn menghadirkan solusi pembelajaran dan pelatihan terpadu untuk meningkatkan skill dan kompetensi tim Anda.",
    keywords: ["excelearn", "pembelajaran", "pelatihan", "company profile"],
    og_title: "Excelearn - Solusi Pembelajaran Terpadu",
    og_description: "Tingkatkan skill tim Anda dengan program pembelajaran Excelearn yang komprehensif",
    og_image: "https://excelearn.example.com/og-image-home.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Excelearn - Solusi Pembelajaran Terpadu",
    twitter_description: "Tingkatkan skill tim Anda dengan program pembelajaran Excelearn",
    author: "Excelearn Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "about",
    title: "Tentang Kami - Excelearn",
    description: "Pelajari lebih lanjut tentang Excelearn, visi, misi, dan tim kami yang berpengalaman.",
    keywords: ["tentang excelearn", "visi misi", "tim", "perusahaan"],
    og_title: "Tentang Kami - Excelearn",
    og_description: "Kenali lebih dekat Excelearn dan komitmen kami terhadap pendidikan berkualitas",
    og_image: "https://excelearn.example.com/og-image-about.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Tentang Kami - Excelearn",
    author: "Excelearn Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "contact",
    title: "Hubungi Kami - Excelearn",
    description: "Hubungi tim Excelearn untuk konsultasi gratis dan informasi lebih lanjut tentang layanan kami.",
    keywords: ["hubungi", "kontak", "informasi", "support"],
    og_title: "Hubungi Kami - Excelearn",
    og_description: "Dapatkan dukungan langsung dari tim Excelearn untuk pertanyaan dan konsultasi Anda",
    og_image: "https://excelearn.example.com/og-image-contact.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Hubungi Kami - Excelearn",
    author: "Excelearn Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "product",
    title: "Produk Kami - Excelearn",
    description: "Jelajahi produk dan solusi unggulan dari Excelearn untuk kebutuhan pembelajaran dan pengembangan organisasi Anda.",
    keywords: ["produk", "solusi", "layanan", "paket"],
    og_title: "Produk Kami - Excelearn",
    og_description: "Temukan solusi pembelajaran inovatif dari Excelearn untuk bisnis Anda",
    og_image: "https://excelearn.example.com/og-image-product.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Produk Kami - Excelearn",
    author: "Excelearn Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "schedule",
    title: "Jadwal & Ketersediaan - Excelearn",
    description: "Lihat jadwal program pelatihan dan ketersediaan Excelearn untuk mendaftar sesuai dengan waktu Anda.",
    keywords: ["jadwal", "program", "ketersediaan", "pendaftaran"],
    og_title: "Jadwal & Ketersediaan - Excelearn",
    og_description: "Cek jadwal program pelatihan Excelearn dan daftarkan diri Anda sekarang",
    og_image: "https://excelearn.example.com/og-image-schedule.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Jadwal & Ketersediaan - Excelearn",
    author: "Excelearn Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "service",
    title: "Layanan Kami - Excelearn",
    description: "Temukan berbagai layanan profesional dari Excelearn untuk mendukung pertumbuhan bisnis Anda.",
    keywords: ["layanan", "konsultasi", "training", "support"],
    og_title: "Layanan Kami - Excelearn",
    og_description: "Nikmati berbagai layanan profesional dari Excelearn untuk kesuksesan bisnis Anda",
    og_image: "https://excelearn.example.com/og-image-service.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Layanan Kami - Excelearn",
    author: "Excelearn Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
];

async function seedMetadata() {
  try {
    // Clear existing metadata
    await Metadata.deleteMany({});
    console.log("Cleared existing metadata");

    // Insert new metadata
    const result = await Metadata.insertMany(metadataSeeds);
    console.log(`Inserted ${result.length} metadata records`);

    return result;
  } catch (error) {
    console.error("Error seeding metadata:", error);
    throw error;
  }
}

module.exports = seedMetadata;
