-- Allow signature_url to be NULL (for instructor self-confirmations without teacher signature)
ALTER TABLE signatures ALTER COLUMN signature_url DROP NOT NULL;
