-- Add an owner tier within the 'admin' role. All admins keep identical access
-- everywhere else in the app; only the owner (is_owner = true) may delete an
-- admin profile. Regular admins (e.g. שירן, רוית) cannot delete admin accounts,
-- including their own or each other's.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT false;

UPDATE profiles SET is_owner = true WHERE email = 'levihaimm@gmail.com';

DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Any admin can delete instructor profiles; only the owner can delete admin profiles.
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    AND (
      role <> 'admin'
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
    )
  );
