-- Check ALL columns in wallet_transactions to see what data we have
SELECT *
FROM wallet_transactions
ORDER BY created_at DESC
LIMIT 5;

-- Also check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'wallet_transactions'
ORDER BY ordinal_position;
