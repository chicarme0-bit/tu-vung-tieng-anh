import { ReviewTrainer } from "@/components/review/review-trainer";
import { demoReviewItems } from "@/lib/demo-data";

export const dynamic = "force-static";

export default function ReviewPage() {
  return <ReviewTrainer items={demoReviewItems} />;
}
