const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    job_id: { type: String, unique: true },
    // Employer Info
    employer_name: String,
    employer_logo: String,
    employer_website: String,
    employer_company_type: String,

    // Job Core Info
    job_title: String,
    job_employment_type: String,
    job_description: String,
    job_apply_link: String,
    job_is_remote: Boolean,
    job_city: String,
    job_state: String,
    job_country: String,
    job_latitude: Number,
    job_longitude: Number,
    job_location: String,

    // Salary Info
    job_min_salary: Number,
    job_max_salary: Number,
    job_salary_currency: String,
    job_salary_period: String,

    // Dates
    job_posted_at_datetime_utc: String,
    job_posted_human_readable: String,
    job_expiration_date: String,
    job_offer_expiration_datetime_utc: String,

    // Additional Data
    job_highlights: {
      Qualifications: [String],
      Responsibilities: [String],
      Benefits: [String],
    },
    job_benefits: [String],
    job_required_experience: String,
    job_required_education: String,
    job_required_skills: [String],
    job_industry: String,
    job_category: String,
    job_job_title_snippet: String,
    job_publisher: String,
    job_source: String,
    job_job_api_source: String,
  },
  { timestamps: true }
);

// Indexes for faster queries
jobSchema.index({
  job_title: 'text',
  job_description: 'text',
  employer_name: 'text',
}); // Text search
jobSchema.index({ job_city: 1, job_state: 1, job_country: 1 }); // Location filtering
jobSchema.index({ job_posted_at_datetime_utc: -1 }); // Sorting by date
jobSchema.index({ job_employment_type: 1 }); // Employment type filtering
jobSchema.index({ job_is_remote: 1 }); // Remote filtering
jobSchema.index({ job_min_salary: 1, job_max_salary: 1 }); // Salary filtering

module.exports = mongoose.model('Job', jobSchema);
