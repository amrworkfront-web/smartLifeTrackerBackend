const mongoose = require("mongoose");

const habitLogSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    data: {
      // checklist (الصلاة)
      checkedItems: [String], // ["fajr", "asr"]

      // counter
      count: Number,

      // session (مذاكرة)
      sessions: [
        {
          topic: String,
          duration: Number, // بالدقائق
        },
      ],
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// منع تكرار نفس العادة في نفس اليوم
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HabitLog", habitLogSchema);
