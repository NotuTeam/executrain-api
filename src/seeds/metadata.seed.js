/** @format */

const mongoose = require("mongoose");
const Metadata = require("../routes/metadata/model");
const { STATUS } = require("../config/enum");

const metadataSeeds = [
  {
    page: "home",
    title: "Executrain - Solusi Pembelajaran Terpadu",
    description:
      "Executrain menghadirkan solusi pembelajaran dan pelatihan terpadu untuk meningkatkan skill dan kompetensi tim Anda.",
    keywords: ["executrain", "pembelajaran", "pelatihan", "company profile"],
    og_title: "Executrain - Solusi Pembelajaran Terpadu",
    og_description:
      "Tingkatkan skill tim Anda dengan program pembelajaran Executrain yang komprehensif",
    og_image: "https://executrain.example.com/og-image-home.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Executrain - Solusi Pembelajaran Terpadu",
    twitter_description:
      "Tingkatkan skill tim Anda dengan program pembelajaran Executrain",
    author: "Executrain Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "about",
    title: "Tentang Kami - Executrain",
    description:
      "Pelajari lebih lanjut tentang Executrain, visi, misi, dan tim kami yang berpengalaman.",
    keywords: ["tentang executrain", "visi misi", "tim", "perusahaan"],
    og_title: "Tentang Kami - Executrain",
    og_description:
      "Kenali lebih dekat Executrain dan komitmen kami terhadap pendidikan berkualitas",
    og_image: "https://executrain.example.com/og-image-about.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Tentang Kami - Executrain",
    author: "Executrain Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "contact",
    title: "Hubungi Kami - Executrain",
    description:
      "Hubungi tim Executrain untuk konsultasi gratis dan informasi lebih lanjut tentang layanan kami.",
    keywords: ["hubungi", "kontak", "informasi", "support"],
    og_title: "Hubungi Kami - Executrain",
    og_description:
      "Dapatkan dukungan langsung dari tim Executrain untuk pertanyaan dan konsultasi Anda",
    og_image: "https://executrain.example.com/og-image-contact.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Hubungi Kami - Executrain",
    author: "Executrain Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "product",
    title: "Produk Kami - Executrain",
    description:
      "Jelajahi produk dan solusi unggulan dari Executrain untuk kebutuhan pembelajaran dan pengembangan organisasi Anda.",
    keywords: ["produk", "solusi", "layanan", "paket"],
    og_title: "Produk Kami - Executrain",
    og_description:
      "Temukan solusi pembelajaran inovatif dari Executrain untuk bisnis Anda",
    og_image: "https://executrain.example.com/og-image-product.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Produk Kami - Executrain",
    author: "Executrain Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "schedule",
    title: "Jadwal & Ketersediaan - Executrain",
    description:
      "Lihat jadwal program pelatihan dan ketersediaan Executrain untuk mendaftar sesuai dengan waktu Anda.",
    keywords: ["jadwal", "program", "ketersediaan", "pendaftaran"],
    og_title: "Jadwal & Ketersediaan - Executrain",
    og_description:
      "Cek jadwal program pelatihan Executrain dan daftarkan diri Anda sekarang",
    og_image: "https://executrain.example.com/og-image-schedule.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Jadwal & Ketersediaan - Executrain",
    author: "Executrain Team",
    language: "id",
    robots: { index: true, follow: true },
    status: STATUS.PUBLISHED,
  },
  {
    page: "service",
    title: "Layanan Kami - Executrain",
    description:
      "Temukan berbagai layanan profesional dari Executrain untuk mendukung pertumbuhan bisnis Anda.",
    keywords: ["layanan", "konsultasi", "training", "support"],
    og_title: "Layanan Kami - Executrain",
    og_description:
      "Nikmati berbagai layanan profesional dari Executrain untuk kesuksesan bisnis Anda",
    og_image: "https://executrain.example.com/og-image-service.jpg",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "Layanan Kami - Executrain",
    author: "Executrain Team",
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
