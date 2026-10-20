-- Admin checkbox on absence lessons: "לקוח קיבל עדכון"
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS client_notified boolean NOT NULL DEFAULT false;
