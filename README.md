# Tu Vung Tieng Anh MVP

MVP hoc tu vung tieng Anh cho nguoi dung Viet Nam voi:
- dang ky, dang nhap bang email va mat khau
- luu tu vung ca nhan va thu vien tu vung he thong
- flashcard on tap hai chieu
- quiz Anh -> Viet va Viet -> Anh
- luu streak va lich su quiz
- luu Gemini API key theo tung user, ma hoa o server
- tao tu vung dong bang Gemini

## Stack
- Next.js 15
- React 19
- Prisma
- PostgreSQL
- jose cho session cookie
- bcryptjs cho password hashing
- zod cho request validation

## Bien moi truong
Copy `.env.example` thanh `.env` va sua:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tu_vung_tieng_anh"
SESSION_SECRET="replace-with-a-long-random-secret"
MASTER_ENCRYPTION_KEY="replace-with-32-byte-key"
```

## Cai dat
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Tai khoan demo sau khi seed
- email: `demo@example.com`
- password: `password123`

## Tinh nang chinh
- `/dashboard`: tong quan tien do, streak, lich su quiz
- `/vocabulary`: them tu moi, quan ly bo tu, tao tu bang Gemini
- `/review`: flashcard on tap va ghi nhan ket qua Again/Hard/Good/Easy
- `/quiz`: tao quiz theo huong va chu de
- `/settings`: luu Gemini API key da ma hoa

## Luu y bao mat
- Gemini API key khong duoc hash bang bcrypt vi can dung lai de goi API
- Key duoc ma hoa bang AES-256-GCM trong `src/lib/crypto.ts`
- Session dang nhap dung signed cookie server-side

## Tep quan trong
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/auth.ts`
- `src/lib/crypto.ts`
- `src/app/api/*`
- `src/app/*`

## Trang thai hien tai
- `npm run build` da pass
- can PostgreSQL local de chay migrate va seed
- Gemini generation can API key hop le o trang Cai dat

## Deploy len Netlify
- Repo nay da co [netlify.toml](./netlify.toml) va script `npm run netlify-build` de Netlify build duoc ngay sau khi import repo.
- Trong Netlify, them 3 environment variables:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `MASTER_ENCRYPTION_KEY`
- Build command: `npm run netlify-build`
- Publish directory: `.next`
- Migration database nen chay thu cong tu may cua ban sau khi da tro `DATABASE_URL` vao database production:

```bash
npx prisma migrate deploy
npm run prisma:seed
```

- App nay dung SSR va API routes cua Next.js, nen khong phu hop voi cach keo-tha mot thu muc static da export. Cach dung dung la import repo vao Netlify hoac deploy bang Netlify CLI.
