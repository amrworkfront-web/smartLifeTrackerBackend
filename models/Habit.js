const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["boolean", "counter", "checklist", "session"],
      required: true,
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },

    meta: {
      // للصلاة (checklist)
      items: [
        {
          key: String,     // fajr, dhuhr, asr...
          label: String,   // الفجر، الظهر...
        },
      ],

      // للعداد (counter / session)
      target: {
        type: Number, // مثال: 1 للجيم / 60 دقيقة مذاكرة
      },

      unit: {
        type: String, // minutes, times, sessions
      },
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);
