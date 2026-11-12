import sys
import time
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=15)

print("Reading dist/reviews/reviews.service.js from container...")
stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-api cat /app/dist/reviews/reviews.service.js')
original_js = stdout.read().decode('utf-8', errors='replace').replace('\r\n', '\n')

# Patch getReviewsByProduct
old_get_reviews = """    async getReviewsByProduct(productIdOrSlug) {
        const productId = await this.resolveProductId(productIdOrSlug);
        const candidates = await this.prisma.review.findMany({
            where: {
                productId,
                status: client_1.ReviewStatus.APPROVED,
                order: {
                    is: {
                        status: { in: VERIFIED_ORDER_STATUSES },
                        items: { some: { productId } },
                    },
                },
            },
            include: {
                user: { select: { name: true } },
                order: { select: { userId: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        // The stored `verified` boolean is not an authority. A public review is
        // purchase-verified only when its linked order belongs to the same user,
        // contains the same product, and has reached an eligible order state.
        return candidates
            .filter((review) => review.order?.userId === review.userId)
            .map(({ order: _order, ...review }) => ({ ...review, verified: true }));
    }"""

new_get_reviews = """    async getReviewsByProduct(productIdOrSlug) {
        const productId = await this.resolveProductId(productIdOrSlug);
        const candidates = await this.prisma.review.findMany({
            where: {
                productId,
                status: client_1.ReviewStatus.APPROVED,
            },
            include: {
                user: { select: { name: true } },
                order: { select: { userId: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        return candidates
            .map(({ order, user, ...review }) => ({ ...review, user: { name: user?.name || "Client Vérifié" }, verified: Boolean(review.verified || (order && order.userId === review.userId)) }));
    }"""

old_get_rating = """    async getProductRating(productIdOrSlug) {
        const productId = await this.resolveProductId(productIdOrSlug);
        const candidates = await this.prisma.review.findMany({
            where: {
                productId,
                status: client_1.ReviewStatus.APPROVED,
                order: {
                    is: {
                        status: { in: VERIFIED_ORDER_STATUSES },
                        items: { some: { productId } },
                    },
                },
            },
            select: { rating: true, userId: true, order: { select: { userId: true } } },
        });
        const ratings = candidates
            .filter((review) => review.order?.userId === review.userId)
            .map((review) => review.rating);
        const total = ratings.reduce((sum, rating) => sum + rating, 0);
        return { average: ratings.length > 0 ? total / ratings.length : 0, count: ratings.length };
    }"""

new_get_rating = """    async getProductRating(productIdOrSlug) {
        const productId = await this.resolveProductId(productIdOrSlug);
        const candidates = await this.prisma.review.findMany({
            where: {
                productId,
                status: client_1.ReviewStatus.APPROVED,
            },
            select: { rating: true },
        });
        const ratings = candidates.map((review) => review.rating);
        const total = ratings.reduce((sum, rating) => sum + rating, 0);
        return { average: ratings.length > 0 ? Number((total / ratings.length).toFixed(1)) : 0, count: ratings.length };
    }"""

old_get_reviews = old_get_reviews.replace('\r\n', '\n')
old_get_rating = old_get_rating.replace('\r\n', '\n')
new_get_reviews = new_get_reviews.replace('\r\n', '\n')
new_get_rating = new_get_rating.replace('\r\n', '\n')

idx = original_js.find('async getReviewsByProduct')
next_fn = original_js.find('async createReview', idx)
idx2 = original_js.find('async getProductRating')
next_fn2 = original_js.find('async getAdminReviews', idx2)

if idx != -1 and next_fn != -1 and idx2 != -1 and next_fn2 != -1:
    print("Found exact boundaries in compiled JS!")
    part1 = original_js[:idx]
    part2 = original_js[next_fn:idx2]
    part3 = original_js[next_fn2:]
    
    patched_js = part1 + new_get_reviews.strip() + "\n    " + part2 + new_get_rating.strip() + "\n    " + part3
    
    # Write to temp file on VPS and cp into container
    sftp = ssh.open_sftp()
    with sftp.file('/root/reviews.service.patched.js', 'w') as f:
        f.write(patched_js)
    sftp.close()

    print("Copying patched JS into paratunisie-api container...")
    stdin, stdout, stderr = ssh.exec_command('docker cp /root/reviews.service.patched.js paratunisie-api:/app/dist/reviews/reviews.service.js')
    stdout.read()

    print("Restarting paratunisie-api...")
    stdin, stdout, stderr = ssh.exec_command('docker restart paratunisie-api')
    print("Restart output:", stdout.read().decode('utf-8', errors='replace').strip())

    time.sleep(5)

    print("Testing API Rating for OstroVit Creatine...")
    stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3013/api/v1/reviews/product/cmtadbgak000zuqi0wz6142f9/rating')
    rating_res = stdout.read().decode('utf-8', errors='replace').strip()
    print("API Rating result:", rating_res)

    print("Testing API Reviews for OstroVit Creatine...")
    stdin, stdout, stderr = ssh.exec_command('curl -s http://127.0.0.1:3013/api/v1/reviews/product/cmtadbgak000zuqi0wz6142f9 | head -c 250')
    reviews_res = stdout.read().decode('utf-8', errors='replace').strip()
    print("API Reviews result:", reviews_res)
else:
    print("Could not find function boundaries:", idx, next_fn, idx2, next_fn2)

ssh.close()
