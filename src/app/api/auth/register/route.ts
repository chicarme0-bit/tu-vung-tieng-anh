import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    error: "Chức năng tạo tài khoản đã được gỡ bỏ. Bạn có thể dùng website ngay mà không cần tài khoản."
  }, { status: 410 });
}
