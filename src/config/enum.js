/** @format */

const ROLE = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
};

const AVAILABILITY = {
  FULL_BOOKED: "FULL_BOOKED",
  OPEN_SEAT: "OPEN_SEAT",
};

const STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
};

const CATEGORIES = [
  { IT_TRAINING: "IT_TRAINING" },
  { IT_CONSULTANT: "IT_CONSULTANT" },
  { IT_SUPPORT: "IT_SUPPORT" },
];

const SKILL_LEVELS = [
  { BEGINNER: "BEGINNER" },
  { INTERMEDIATE: "INTERMEDIATE" },
  { EXPERT: "EXPERT" },
];

const LANGUAGES = [{ INDONESIA: "INDONESIA" }, { INGGRIS: "INGGRIS" }];

const RefreshToken = "exc_refresh_token";

module.exports = {
  ROLE,
  AVAILABILITY,
  STATUS,
  CATEGORIES,
  SKILL_LEVELS,
  LANGUAGES,
  RefreshToken,
};
