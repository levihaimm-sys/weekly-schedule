-- Add request type to distinguish absence, lateness, and other instructor requests
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS instructor_request_type TEXT
  CHECK (instructor_request_type IN ('absence', 'lateness', 'other'));

-- Track whether an instructor request has been handled by admin
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS instructor_request_handled BOOLEAN DEFAULT false;
