-- Recreate the unique constraint on users.donorId
ALTER TABLE users ADD CONSTRAINT users_donorId_unique UNIQUE ("donorId");

-- Recreate foreign keys
ALTER TABLE blood_donations ADD CONSTRAINT donations_donorId_fkey FOREIGN KEY ("donorId") REFERENCES users("donorId");
ALTER TABLE blood_donations ADD CONSTRAINT donations_recipientId_fkey FOREIGN KEY ("recipientId") REFERENCES users("donorId");

ALTER TABLE messages ADD CONSTRAINT fk_sender FOREIGN KEY ("senderId") REFERENCES users("donorId");
ALTER TABLE messages ADD CONSTRAINT fk_recipient FOREIGN KEY ("recipientId") REFERENCES users("donorId");

ALTER TABLE testimonials ADD CONSTRAINT fk_testimonials_reviewer FOREIGN KEY ("reviewerId") REFERENCES users("donorId");
ALTER TABLE testimonials ADD CONSTRAINT fk_testimonials_reviewee FOREIGN KEY ("revieweeId") REFERENCES users("donorId");

ALTER TABLE gbr_requests ADD CONSTRAINT fk_requester FOREIGN KEY ("requesterId") REFERENCES users("donorId");
ALTER TABLE gbr_requests ADD CONSTRAINT fk_recipient FOREIGN KEY ("recipientId") REFERENCES users("donorId");

-- Add new columns
ALTER TABLE blood_donations ADD COLUMN IF NOT EXISTS donation_type TEXT;
ALTER TABLE blood_donations ADD COLUMN IF NOT EXISTS hemoglobin DECIMAL;

ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS responder_id INTEGER;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS emergency_type TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS upazila TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS division TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS latitude DECIMAL;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS longitude DECIMAL;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS approval_type TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS approved_by INTEGER;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS rejected_by INTEGER;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE emergency_blood_requests ADD COLUMN IF NOT EXISTS device_info TEXT;

ALTER TABLE gbr_requests ADD COLUMN IF NOT EXISTS requesterId INTEGER;
ALTER TABLE gbr_requests ADD COLUMN IF NOT EXISTS recipientId INTEGER;