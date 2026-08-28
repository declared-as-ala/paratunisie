import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS, timeout=30)

sql = """
DO $block$
DECLARE
    target_uid TEXT;
    acc_id TEXT;
    total_pts INT;
BEGIN
    SELECT id INTO target_uid FROM "User" WHERE email = 'kongeminam@gmail.com';
    IF target_uid IS NOT NULL THEN
        -- Get or create loyalty account
        SELECT id INTO acc_id FROM "LoyaltyAccount" WHERE "userId" = target_uid;
        IF acc_id IS NULL THEN
            INSERT INTO "LoyaltyAccount" ("id", "userId", "points", "tier", "createdAt", "updatedAt")
            VALUES ('acc_' || target_uid, target_uid, 0, 'Bronze', NOW(), NOW())
            RETURNING id INTO acc_id;
        END IF;

        -- Move transactions from duplicate accounts with same phone or email
        UPDATE "LoyaltyTransaction"
        SET "accountId" = acc_id, "userId" = target_uid
        WHERE "userId" IN (
            SELECT id FROM "User" WHERE phone = '+21697991266' OR phone = '97991266' OR email = 'kongeminam@gmail.com' OR email = 'missaouiala7@gmail.com'
        );

        -- Move orders to target_uid
        UPDATE "Order"
        SET "userId" = target_uid
        WHERE "userId" IN (
            SELECT id FROM "User" WHERE phone = '+21697991266' OR phone = '97991266' OR email = 'kongeminam@gmail.com' OR email = 'missaouiala7@gmail.com'
        );

        -- Delete stale loyalty accounts of duplicate users
        DELETE FROM "LoyaltyAccount"
        WHERE "userId" IN (
            SELECT id FROM "User" WHERE (phone = '+21697991266' OR phone = '97991266' OR email = 'missaouiala7@gmail.com') AND id != target_uid
        );

        -- Calculate real balance
        SELECT COALESCE(SUM(CASE WHEN type = 'EARN' THEN points WHEN type = 'REDEEM' THEN -points ELSE points END), 0)
        INTO total_pts
        FROM "LoyaltyTransaction"
        WHERE "accountId" = acc_id;

        UPDATE "LoyaltyAccount"
        SET points = GREATEST(0, total_pts)
        WHERE id = acc_id;
        
        RAISE NOTICE 'Target User ID: %, Account ID: %, Total Points: %', target_uid, acc_id, total_pts;
    END IF;
END $block$;
"""

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie")
stdin.write(sql)
stdin.channel.shutdown_write()

print("=== FIX OUTPUT ===")
print(stdout.read().decode())
print(stderr.read().decode())

verify_sql = """
SELECT u.id, u.email, u.name, la.id as account_id, la.points, la.tier
FROM "User" u
LEFT JOIN "LoyaltyAccount" la ON la."userId" = u.id
WHERE u.email = 'kongeminam@gmail.com';

SELECT id, "accountId", "userId", "orderId", points, type, description, "createdAt"
FROM "LoyaltyTransaction"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'kongeminam@gmail.com')
ORDER BY "createdAt" DESC;
"""

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie")
stdin.write(verify_sql)
stdin.channel.shutdown_write()

print("=== VERIFY OUTPUT ===")
print(stdout.read().decode())
print(stderr.read().decode())

client.close()
